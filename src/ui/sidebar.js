// src/ui/sidebar.js
import { $, clear, fromTemplate, addClass } from "./dom.js";
import { state, save, setCurrentDeck } from "../core/state.js";
import { listDecks, dueCount } from "../core/models.js";

/**
 * Renderiza la lista de mazos en el sidebar.
 * @param {Function} onAfter - callback para refrescar la UI (p.ej. renderAll)
 */
export function renderSidebar(onAfter) {
  const list = $("#deckList");
  clear(list);

  listDecks().forEach((d) => {
    const tpl = fromTemplate("tplDeckBtn");
    const btn = tpl.querySelector("button");
    tpl.querySelector(".deck-name").textContent = d.name;
    tpl.querySelector(".due").textContent = String(dueCount(d.id));

    if (state.currentDeck === d.id) addClass(btn, "active");

    btn.addEventListener("click", () => {
      setCurrentDeck(d.id); // ya hace save() por dentro
      onAfter?.();
    });

    list.appendChild(tpl);
  });
}

/**
 * Bindea acciones del sidebar (crear mazo).
 * @param {Function} onAfter - callback para refrescar la UI (p.ej. renderAll)
 * @param {(name:string)=>void} createDeckFn - función para crear mazos
 */
export function bindSidebar(onAfter, createDeckFn) {
  const btn = $("#addDeck");
  const input = $("#deckName");
  btn?.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;
    createDeckFn(name);
    input.value = "";
    onAfter?.();
  });
}
