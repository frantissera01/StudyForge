// src/core/models.js
import { state, save, deck, setCurrentDeck } from "./state.js";

/** Utilidades locales */
function uuid() {
  return (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}

/** -------------------- Decks -------------------- **/
export function createDeck(name) {
  const id = uuid();
  state.decks[id] = { id, name: name?.trim() || "Nuevo mazo", created: Date.now(), cards: [] };
  setCurrentDeck(id); // guarda y emite cambio
  return id;
}

export function renameDeck(deckId, name) {
  const d = state.decks[deckId];
  if (!d) return;
  d.name = name?.trim() || d.name;
  save();
}

export function deleteDeck(deckId) {
  if (!state.decks[deckId]) return;
  delete state.decks[deckId];
  if (state.currentDeck === deckId) {
    // Seleccionar otro mazo si existe
    const nextId = Object.keys(state.decks)[0] || null;
    setCurrentDeck(nextId);
  } else {
    save();
  }
}

export function listDecks() {
  return Object.values(state.decks).sort((a, b) => a.created - b.created);
}

/** Cantidad de tarjetas vencidas (para hoy) por mazo */
export function dueCount(deckId) {
  const d = state.decks[deckId];
  if (!d) return 0;
  const start = todayStart();
  return d.cards.filter(c => c.due <= start).length;
}

/** -------------------- Cards -------------------- **/
/**
 * Estructura de Card:
 * { id, q, a, tags[], created, last, due, ease, interval, reps }
 */
export function createCard({ q, a, tags = [] }) {
  const d = deck();
  if (!d) throw new Error("No hay mazo activo.");
  const card = {
    id: uuid(),
    q: String(q || "").trim(),
    a: String(a || "").trim(),
    tags: tags.map(t => String(t).trim()).filter(Boolean),
    created: Date.now(),
    last: 0,
    due: todayStart(),       // disponible hoy
    ease: 2.5,               // SM-2 base
    interval: 0,
    reps: 0,
  };
  d.cards.push(card);
  save();
  return card.id;
}

export function updateCard(cardId, patch) {
  const d = deck();
  if (!d) return;
  const i = d.cards.findIndex(c => c.id === cardId);
  if (i < 0) return;
  const prev = d.cards[i];
  d.cards[i] = {
    ...prev,
    ...patch,
    q: patch.q !== undefined ? String(patch.q).trim() : prev.q,
    a: patch.a !== undefined ? String(patch.a).trim() : prev.a,
    tags: patch.tags !== undefined
      ? patch.tags.map(t => String(t).trim()).filter(Boolean)
      : prev.tags,
  };
  save();
}

export function deleteCard(cardId) {
  const d = deck();
  if (!d) return;
  d.cards = d.cards.filter(c => c.id !== cardId);
  save();
}

/** Helpers */
export function getCard(cardId) {
  const d = deck();
  if (!d) return null;
  return d.cards.find(c => c.id === cardId) || null;
}

export function listCards(deckId) {
  const d = state.decks[deckId];
  return d ? d.cards.slice() : [];
}

/** -------------------- Fechas -------------------- **/
export function todayStart() {
  return new Date(new Date().toDateString()).getTime();
}
