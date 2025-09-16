// src/core/cloze.js

/**
 * Sintaxis: {{c1::respuesta}} o {{c1::respuesta::pista}}
 * Múltiples huecos admitidos: c1, c2, ...
 */

const RE = /\{\{\s*c(\d+)\s*::\s*([^}:]+?)\s*(?:::\s*([^}]+?)\s*)?\}\}/g;

export function isCloze(text = "") {
  return RE.test(text);
}

/** Devuelve el texto de la pregunta con huecos (____ o pista entre paréntesis) */
export function clozeQuestion(text = "") {
  return text.replace(RE, (_, idx, ans, hint) => {
    const h = hint ? ` (${hint.trim()})` : "";
    return `**[c${idx}]** ____${h}`;
  });
}

/** Devuelve el texto con respuestas resaltadas */
export function clozeAnswer(text = "") {
  return text.replace(RE, (_, idx, ans) => `**[c${idx}]** **${ans.trim()}**`);
}
