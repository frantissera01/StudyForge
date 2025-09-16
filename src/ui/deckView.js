// src/ui/deckView.js
import { $, clear, fromTemplate, fmtDate } from "./dom.js";
import { deck } from "../core/state.js";
import { todayStart } from "../core/storage.js";
import { deleteCard } from "../core/models.js";
import { openCardModal } from "./modals.js";
import { clozeQuestion } from "../core/cloze.js";
import { filterCards, highlightText } from "./filters.js";
import { refreshTagsDatalist } from "./autocomplete.js";

function previewText(card) {
  if (card.type === "cloze") {
    const q = clozeQuestion(card.q);
    return q.length > 80 ? q.slice(0, 80) + "…" : q;
  }
  return card.a.length > 80 ? card.a.slice(0, 80) + "…" : card.a;
}

export function renderDeckView() {
  const hasDeck = !!deck();
  $("#view-empty").classList.toggle("d-none", hasDeck);
  $("#view-deck").classList.toggle("d-none", !hasDeck);
  $("#view-study").classList.add("d-none");

  refreshTagsDatalist();

  if (!hasDeck) return;

  const d = deck();
  $("#deckTitle").textContent = d.name;
  $("#deckCount").textContent = d.cards.length;
  $("#dueToday").textContent = d.cards.filter((c) => c.due <= todayStart()).length;

  const grid = $("#cardsGrid");
  clear(grid);

  const filtered = filterCards(d.cards);
  filtered.forEach((c) => {
    const qShort = c.q.length > 48 ? c.q.slice(0, 48) + "…" : c.q;
    tpl.querySelector(".title").innerHTML = highlightText(qShort, $("#searchQ")?.value || "");
    tpl.querySelector(".preview").innerHTML = highlightText(previewText(c), $("#searchQ")?.value || "");
    tpl.querySelector(".next").textContent = fmtDate(c.due);

    const tags = tpl.querySelector(".tags");
    (c.tags || []).forEach((t) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tags.appendChild(span);
    });

    tpl.querySelector(".btn-edit").addEventListener("click", () => openCardModal(c.id));
    tpl.querySelector(".btn-del").addEventListener("click", () => {
      if (confirm("¿Borrar tarjeta?")) { deleteCard(c.id); renderDeckView(); }
    });

    grid.appendChild(tpl);
  });
}
