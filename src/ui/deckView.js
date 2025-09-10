// src/ui/deckView.js
import { $, clear, fromTemplate, fmtDate } from "./dom.js";
import { deck } from "../core/state.js";
import { todayStart } from "../core/storage.js";
import { deleteCard } from "../core/models.js";
import { openCardModal } from "./modals.js";

/**
 * Renderiza la vista de mazo (grid de tarjetas) y muestra/oculta secciones.
 */
export function renderDeckView() {
  const hasDeck = !!deck();
  $("#view-empty").classList.toggle("d-none", hasDeck);
  $("#view-deck").classList.toggle("d-none", !hasDeck);
  $("#view-study").classList.add("d-none");

  if (!hasDeck) return;

  const d = deck();
  $("#deckTitle").textContent = d.name;
  $("#deckCount").textContent = d.cards.length;
  $("#dueToday").textContent = d.cards.filter((c) => c.due <= todayStart()).length;

  const grid = $("#cardsGrid");
  clear(grid);

  d.cards
    .slice()
    .reverse()
    .forEach((c) => {
      const tpl = fromTemplate("tplCard");
      tpl.querySelector(".title").textContent = c.q.length > 48 ? c.q.slice(0, 48) + "…" : c.q;
      tpl.querySelector(".preview").textContent = c.a.length > 80 ? c.a.slice(0, 80) + "…" : c.a;
      tpl.querySelector(".next").textContent = fmtDate(c.due);

      const tags = tpl.querySelector(".tags");
      (c.tags || []).forEach((t) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = t;
        tags.appendChild(span);
      });

      // Acciones
      tpl.querySelector(".btn-edit").addEventListener("click", () => openCardModal(c.id));
      tpl.querySelector(".btn-del").addEventListener("click", () => {
        if (confirm("¿Borrar tarjeta?")) {
          deleteCard(c.id);
          renderDeckView();
        }
      });

      grid.appendChild(tpl);
    });
}

/**
 * Bindea los botones superiores de la vista de mazo.
 * @param {Function} startStudy - función que inicia la sesión de estudio
 */
export function bindDeckHeader(startStudy) {
  $("#btnAddCard")?.addEventListener("click", () => openCardModal(null));
  $("#btnStudy")?.addEventListener("click", () => startStudy());
}
