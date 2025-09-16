// src/ui/markdown.js
import { setHTML } from "./dom.js";

/**
 * Renderiza Markdown + LaTeX en un contenedor.
 * Usa marked (global) y KaTeX auto-render.
 */
export function renderMD(el, text = "") {
  const md = (window.marked ? window.marked.parse(text) : text);
  setHTML(el, md);

  // Render LaTeX si KaTeX está disponible
  if (window.renderMathInElement) {
    window.renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
      ],
      throwOnError: false,
    });
  }
}
