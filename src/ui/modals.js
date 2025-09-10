// src/ui/modals.js
import { $, setText } from "./dom.js";
import { deck } from "../core/state.js";
import { createCard, updateCard } from "../core/models.js";

// Instancia Bootstrap Modal (desde CDN) una vez
let cardModal = null;
function ensureModal() {
  if (!cardModal) {
    // eslint-disable-next-line no-undef
    cardModal = new bootstrap.Modal("#cardModal");
  }
}

let editingCardId = null;

/**
 * Abre el modal de tarjeta (crear/editar).
 * @param {string|null} cardId
 */
export function openCardModal(cardId = null) {
  ensureModal();
  editingCardId = cardId;
  const isEdit = !!cardId;

  setText($("#cardModalTitle"), isEdit ? "Editar tarjeta" : "Nueva tarjeta");

  const c = isEdit ? deck()?.cards.find((x) => x.id === cardId) : null;
  $("#inpQ").value = c?.q || "";
  $("#inpA").value = c?.a || "";
  $("#inpTags").value = (c?.tags || []).join(", ");

  cardModal.show();
}

/**
 * Bindea el botón Guardar del modal.
 * @param {Function} onAfter - callback para refrescar (p.ej. renderAll)
 */
export function bindModal(onAfter) {
  $("#saveCard")?.addEventListener("click", () => {
    const q = $("#inpQ").value.trim();
    const a = $("#inpA").value.trim();
    const tags = $("#inpTags")
      .value.split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!q || !a) {
      alert("Completá pregunta y respuesta");
      return;
    }

    if (editingCardId) {
      updateCard(editingCardId, { q, a, tags });
    } else {
      createCard({ q, a, tags });
    }
    cardModal.hide();
    onAfter?.();
  });
}
