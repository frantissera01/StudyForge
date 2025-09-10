// src/ui/dom.js

/** ---------------- Selección ---------------- **/
export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** ---------------- Creación ---------------- **/
export function el(tag, cls, attrs = {}) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  return node;
}

/** Clona el contenido de un <template id="..."> */
export function fromTemplate(tplId) {
  const tpl = document.getElementById(tplId);
  if (!tpl) throw new Error(`Template no encontrado: #${tplId}`);
  return tpl.content.cloneNode(true);
}

/** Monta un hijo en un padre y devuelve el hijo (convenience) */
export function mount(parent, child) {
  parent.appendChild(child);
  return child;
}

/** Limpia todos los hijos de un nodo */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** ---------------- Texto y atributos ---------------- **/
export function setText(node, text = "") {
  node.textContent = String(text);
}

export function setHTML(node, html = "") {
  node.innerHTML = html;
}

export function setDisabled(node, disabled = true) {
  node.toggleAttribute("disabled", !!disabled);
}

/** ---------------- Clases y visibilidad ---------------- **/
export function addClass(node, ...cls)    { node.classList.add(...cls); }
export function removeClass(node, ...cls) { node.classList.remove(...cls); }
export function toggleClass(node, cls, on) {
  node.classList.toggle(cls, on === undefined ? undefined : !!on);
}

export function show(node)   { removeClass(node, "d-none"); }
export function hide(node)   { addClass(node, "d-none"); }
export function toggle(node, visible) {
  node.classList.toggle("d-none", visible === undefined ? node.classList.contains("d-none") : !visible);
}

/** ---------------- Fechas ---------------- **/
export function fmtDate(ts, locale) {
  const d = new Date(ts);
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" });
}

/** ---------------- Eventos ---------------- **/
export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/** Delegación de eventos: parent escucha y filtra por selector */
export function onDelegate(parent, type, selector, handler, options) {
  const wrapped = (e) => {
    const match = e.target.closest(selector);
    if (match && parent.contains(match)) handler(e, match);
  };
  parent.addEventListener(type, wrapped, options);
  return () => parent.removeEventListener(type, wrapped, options);
}

/** Atajos de teclado (no captura en inputs/textarea por defecto) */
export function bindKey(key, handler, { target = window, ignoreInputs = true } = {}) {
  const onKey = (e) => {
    if (ignoreInputs) {
      const t = e.target;
      const isFormField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (isFormField) return;
    }
    if (e.key.toLowerCase() === String(key).toLowerCase()) handler(e);
  };
  target.addEventListener("keydown", onKey);
  return () => target.removeEventListener("keydown", onKey);
}

/** ---------------- Utilidades varias ---------------- **/
let __id = 0;
export function safeId(prefix = "sf") {
  __id += 1;
  return `${prefix}-${Date.now().toString(36)}-${__id}`;
}
