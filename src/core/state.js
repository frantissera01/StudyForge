// src/core/state.js

/**
 * Clave de almacenamiento en localStorage
 */
export const storeKey = 'studyforge.v1';

/**
 * Estado inicial
 * decks: { [deckId]: { id, name, created, cards: Card[] } }
 * currentDeck: string | null
 */
export const emptyState = { decks: {}, currentDeck: null };

/**
 * Estado en memoria (mutable)
 */
export let state = load();

/**
 * Carga el estado desde localStorage (o usa emptyState)
 */
export function load() {
  try {
    const raw = localStorage.getItem(storeKey);
    return raw ? JSON.parse(raw) : structuredClone(emptyState);
  } catch {
    return structuredClone(emptyState);
  }
}

/**
 * Persiste el estado y notifica a los listeners
 */
export function save() {
  localStorage.setItem(storeKey, JSON.stringify(state));
  emitChange();
}

/**
 * Devuelve el mazo actualmente seleccionado (o null)
 */
export function deck() {
  return state.decks[state.currentDeck] || null;
}

/**
 * Cambia el mazo activo
 */
export function setCurrentDeck(deckId) {
  state.currentDeck = deckId || null;
  save();
}

/**
 * Reemplaza todo el estado (por ejemplo al importar un backup)
 */
export function replaceState(newState) {
  // Validación mínima
  if (!newState || typeof newState !== 'object' || !newState.decks) {
    throw new Error('Estado inválido');
  }
  state = newState;
  save();
}

/**
 * Resetea el estado a vacío
 */
export function reset() {
  state = structuredClone(emptyState);
  save();
}

/* ------------------------------------------------------------------ */
/* Mini PubSub para cambios de estado (útil para refrescar la UI)     */
/* ------------------------------------------------------------------ */

const listeners = new Set();

/**
 * Suscribir a cambios de estado.
 * @param {(state:any) => void} cb
 * @returns {() => void} función para desuscribir
 */
export function onChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emitChange() {
  for (const cb of listeners) {
    try { cb(state); } catch (e) { /* no-op */ }
  }
}
