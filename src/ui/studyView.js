// src/ui/studyView.js
import { $, clear, setText } from "./dom.js";
import { state, deck, save } from "../core/state.js";
import { todayStart } from "../core/storage.js";
import { schedule, suggestion } from "../core/scheduler.js";
import { clozeQuestion, clozeAnswer } from "../core/cloze.js";
import { renderMD } from "./markdown.js";
import { highlightText } from "./filters.js";

let studyQueue = [];
let current = null;

function setFlipped(v) {
  const flip = $("#flip");
  flip.classList.toggle("flipped", !!v);
  flip.setAttribute("aria-pressed", v ? "true" : "false");
}

function showTags(list) {
  const box = $("#tags");
  clear(box);
  (list || []).forEach((t) => {
    const s = document.createElement("span");
    s.className = "tag";
    s.textContent = t;
    box.appendChild(s);
  });
}

function renderQA(card) {
  const qEl = $("#q");
  const aEl = $("#a");
  const query = $("#searchQ")?.value || "";

  if (card.type === "cloze") {
    // Renderizamos MD a HTML y luego aplicamos highlight sobre el HTML plano.
    renderMD(qEl, clozeQuestion(card.q));
    renderMD(aEl, clozeAnswer(card.q));
  } else {
    renderMD(qEl, card.q);
    renderMD(aEl, card.a);
  }

  // Aplicar resaltado textual simple (no rompe el HTML renderizado de KaTeX/MD)
  if (query) {
    qEl.innerHTML = highlightText(qEl.innerHTML, query);
    aEl.innerHTML = highlightText(aEl.innerHTML, query);
  }
}


/** Carga la siguiente tarjeta o termina la sesión. */
function nextCard(endStudyCb) {
  current = studyQueue.shift();
  if (!current) return endStudyCb();

  setText($("#remain"), studyQueue.length + 1);
  renderQA(current);
  showTags(current.tags);
  setText($("#sugg"), suggestion(current));
  setFlipped(false);
}

export function startStudy(onEnd) {
  const d = deck();
  if (!d) return;

  studyQueue = d.cards.filter((c) => c.due <= todayStart()).sort((a, b) => a.due - b.due);

  if (studyQueue.length === 0) {
    alert("No hay tarjetas para hoy 🎉");
    return;
  }
  $("#view-deck").classList.add("d-none");
  $("#view-study").classList.remove("d-none");
  nextCard(() => endStudy(onEnd));
}

function rate(quality, onEnd) {
  schedule(current, quality);

  if (quality === 0) {
    current.due = todayStart();
    studyQueue.push(current);
  }

  // LOG
  const d = deck();
  try {
    state.logs ||= [];
    state.logs.push({ ts: Date.now(), cardId: current.id, deckId: d?.id || null, quality });
  } catch {}

  save();
  if (!document.getElementById("view-stats")?.classList.contains("d-none")) {
    // Está abierta la vista de estadísticas; refrescar heatmap si existe
    import("./statsView.js").then(m => m.renderStats?.());
  }
  nextCard(() => endStudy(onEnd));
}

export function endStudy(onEnd) {
  $("#view-study").classList.add("d-none");
  $("#view-deck").classList.remove("d-none");
  onEnd?.();
}

export function bindStudyUI(onEnd) {
  const flip = $("#flip");
  $("#btnEndStudy")?.addEventListener("click", () => endStudy(onEnd));
  $("#btnFlip")?.addEventListener("click", () => setFlipped(!flip.classList.contains("flipped")));
  flip?.addEventListener("click", () => setFlipped(!flip.classList.contains("flipped")));
  flip?.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "enter" || k === " ") { e.preventDefault(); setFlipped(!flip.classList.contains("flipped")); }
  });

  $("#rate0")?.addEventListener("click", () => rate(0, onEnd));
  $("#rate1")?.addEventListener("click", () => rate(1, onEnd));
  $("#rate2")?.addEventListener("click", () => rate(2, onEnd));

  window.addEventListener("keydown", (e) => {
    const t = e.target;
    const inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (inField) return;
    const k = e.key.toLowerCase();
    if (k === "f") $("#btnFlip")?.click();
    if (k === "1") $("#rate0")?.click();
    if (k === "2") $("#rate1")?.click();
    if (k === "3") $("#rate2")?.click();
  });
}
