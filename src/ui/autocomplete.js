// src/ui/autocomplete.js
import { $, clear } from "./dom.js";
import { deck } from "../core/state.js";

/** Construye un set de etiquetas únicas del mazo actual */
export function getCurrentDeckTags() {
  const d = deck();
  if (!d) return [];
  const set = new Set();
  d.cards.forEach(c => (c.tags || []).forEach(t => set.add(String(t))));
  return Array.from(set).sort((a,b)=>a.localeCompare(b));
}

/** Rellena el datalist #tagsList con etiquetas del mazo actual */
export function refreshTagsDatalist() {
  const list = $("#tagsList");
  if (!list) return;
  clear(list);
  getCurrentDeckTags().forEach(tag => {
    const opt = document.createElement("option");
    opt.value = tag;
    list.appendChild(opt);
  });
}
