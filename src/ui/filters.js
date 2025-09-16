// src/ui/filters.js
import { $, $$ } from "./dom.js";
import { todayStart } from "../core/storage.js";

/** Estado de filtros en memoria (no lo guardamos en localStorage por ahora) */
const state = {
  q: "",
  due: "all",          // all | today | overdue | new
  tags: [],            // ["js","arrays"]
  sortBy: "createdDesc"// createdDesc | dueAsc | easeDesc
};

export function bindFilters(onChange) {
  $("#searchQ")?.addEventListener("input", (e) => {
    state.q = e.target.value.trim().toLowerCase();
    onChange?.();
  });
  $("#filterDue")?.addEventListener("change", (e) => {
    state.due = e.target.value;
    onChange?.();
  });
  $("#filterTags")?.addEventListener("input", (e) => {
    state.tags = e.target.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    onChange?.();
  });
  $("#sortBy")?.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    onChange?.();
  });
}

/** Aplica búsqueda y filtros sobre el array de tarjetas */
export function filterCards(cards) {
  const q = state.q;
  const tags = state.tags;
  const today = todayStart();

  let out = cards.slice();

  // 1) Texto
  if (q) {
    out = out.filter(c => (c.q || "").toLowerCase().includes(q) || (c.a || "").toLowerCase().includes(q));
  }

  // 2) Due status
  if (state.due === "today") {
    out = out.filter(c => c.due <= today);
  } else if (state.due === "overdue") {
    out = out.filter(c => c.due < today);
  } else if (state.due === "new") {
    out = out.filter(c => (c.reps || 0) === 0);
  }

  // 3) Tags (todas las pedidas deben estar)
  if (tags.length) {
    out = out.filter(c => {
      const ct = (c.tags || []).map(t => String(t).toLowerCase());
      return tags.every(t => ct.includes(t));
    });
  }

  // 4) Orden
  if (state.sortBy === "createdDesc") {
    out.sort((a, b) => (b.created || 0) - (a.created || 0));
  } else if (state.sortBy === "dueAsc") {
    out.sort((a, b) => (a.due || 0) - (b.due || 0));
  } else if (state.sortBy === "easeDesc") {
    out.sort((a, b) => (b.ease || 0) - (a.ease || 0));
  }

  return out;
}

/** Helpers para setear filtros desde afuera si querés */
export function setQuery(q) { state.q = (q || "").toLowerCase(); }
export function setTags(arr) { state.tags = (arr || []).map(s => s.toLowerCase()); }
export function setDue(v) { state.due = v; }
export function setSort(v) { state.sortBy = v; }
