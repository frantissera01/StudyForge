// src/ui/studyView.js
import { $, clear, setText, setHTML } from "./dom.js";
import { deck, save } from "../core/state.js";
import { todayStart } from "../core/storage.js";
import { schedule, suggestion } from "../core/scheduler.js";

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

/** Carga la siguiente tarjeta o termina la sesión. */
function nextCard(endStudyCb) {
  current = studyQueue.shift();
  if (!current) return endStudyCb();

  setText($("#remain"), studyQueue.length + 1);
  setHTML($("#q"), current.q);
  setHTML($("#a"), current.a);
  showTags(current.tags);
  setText($("#sugg"), suggestion(current));
  setFlipped(false);
}

/**
 * Inicia una sesión de estudio con las tarjetas vencidas (due <= hoy).
 * @param {Function} onEnd - callback cuando no quedan tarjetas
 */
export function startStudy(onEnd) {
  const d = deck();
  if (!d) return;

  studyQueue = d.cards.filter((c) => c.due <= todayStart()).sort((a, b) => a.due - b.due);

  if (studyQueue.length === 0) {
    alert("No hay tarjetas para hoy 🎉");
    return;
  }

  // Cambiar vista
  $("#view-deck").classList.add("d-none");
  $("#view-study").classList.remove("d-none");

  nextCard(() => endStudy(onEnd));
}

/** Califica la tarjeta actual y pasa a la siguiente. */
function rate(quality, onEnd) {
  schedule(current, quality);

  // Si es difícil, reinsertar para hoy
  if (quality === 0) {
    current.due = todayStart();
    studyQueue.push(current);
  }

  save();
  nextCard(() => endStudy(onEnd));
}

/** Finaliza la sesión y vuelve a la vista de mazo */
export function endStudy(onEnd) {
  $("#view-study").classList.add("d-none");
  $("#view-deck").classList.remove("d-none");
  onEnd?.(); // típico: volver a renderDeckView()
}

/**
 * Bindea la UI de estudio (botones, flip, atajos).
 * @param {Function} onEnd - callback al terminar sesión (re-render mazo)
 */
export function bindStudyUI(onEnd) {
  const flip = $("#flip");
  $("#btnEndStudy")?.addEventListener("click", () => endStudy(onEnd));
  $("#btnFlip")?.addEventListener("click", () => setFlipped(!flip.classList.contains("flipped")));
  flip?.addEventListener("click", () => setFlipped(!flip.classList.contains("flipped")));
  flip?.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "enter" || k === " ") {
      e.preventDefault();
      setFlipped(!flip.classList.contains("flipped"));
    }
  });

  $("#rate0")?.addEventListener("click", () => rate(0, onEnd));
  $("#rate1")?.addEventListener("click", () => rate(1, onEnd));
  $("#rate2")?.addEventListener("click", () => rate(2, onEnd));

  // Atajos
  window.addEventListener("keydown", (e) => {
    const t = e.target;
    const inField =
      t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (inField) return;

    const k = e.key.toLowerCase();
    if (k === "f") $("#btnFlip")?.click();
    if (k === "1") $("#rate0")?.click();
    if (k === "2") $("#rate1")?.click();
    if (k === "3") $("#rate2")?.click();
  });
}
