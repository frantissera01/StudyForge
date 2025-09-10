// src/core/scheduler.js

/**
 * Implementación simple del algoritmo SM-2 para repetición espaciada.
 * - quality: 0 = difícil, 1 = duda, 2 = fácil
 * - Ajusta ease e intervalos y actualiza `due`, `last`, `interval`, `reps`.
 */

const MS_DAY = 24 * 60 * 60 * 1000;

/** Comienzo del día local (00:00) */
export function todayStart() {
  return new Date(new Date().toDateString()).getTime();
}

/** Clamp numérico */
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Programa la próxima revisión de una tarjeta
 * @param {Card} card - {ease, interval, reps, due, last, ...}
 * @param {0|1|2} quality - 0 difícil, 1 duda, 2 fácil
 */
export function schedule(card, quality) {
  // Mapear calificación usuario a escala SM-2 (0..5) conservadora
  // 0->2 (difícil), 1->3 (duda), 2->4 (fácil)
  const q = [2, 3, 4][quality];

  // Actualizar ease
  // Fórmula SM-2: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  card.ease = clamp((card.ease ?? 2.5) + delta, 1.3, 3.0);

  // Interval
  let interval = card.interval ?? 0;

  if (q < 3) {
    // Respuesta mala → repetir mañana y resetear repeticiones
    interval = 1;
    card.reps = 0;
  } else if ((card.reps ?? 0) === 0) {
    // Primera repetición
    interval = 1;
    card.reps = 1;
  } else if (card.reps === 1) {
    // Segunda repetición
    interval = 3;
    card.reps = 2;
  } else {
    // Siguientes: multiplicar por el ease factor
    interval = Math.round(interval * card.ease);
    // Evitar intervalos demasiado chicos
    interval = Math.max(interval, 4);
  }

  // Si el usuario marcó "difícil" (quality=0), podemos optar por reintroducir la carta hoy.
  // Lo resolvemos en la UI (p.ej., pushing a la cola del día) para controlar UX.
  card.interval = interval;
  card.last = Date.now();
  card.due = todayStart() + interval * MS_DAY;
}

/**
 * Texto de sugerencia para la UI (opcional)
 * @param {Card} card
 * @returns {string}
 */
export function suggestion(card) {
  const interval = card.interval ?? 0;
  if (interval <= 1) return "Sugerido: repetir mañana.";
  if (interval === 3) return "Sugerido: revisar en ~3 días.";
  return `Sugerido: revisar en ~${interval} días.`;
}
