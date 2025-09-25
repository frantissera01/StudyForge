// src/ui/heatmap.js
import { state } from "../core/state.js";
import { $, clear } from "./dom.js";

const MS_DAY = 86400000;

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0,0,0,0);
  return d.getTime();
}

function addDays(ts, n) {
  return ts + n * MS_DAY;
}

/** Devuelve array de {dayTs, count} cubriendo 7*W días, alineado a domingo->sábado */
function buildBuckets(weeks = 52) {
  const days = weeks * 7;
  const today = startOfDay(Date.now());

  // Alinear al sábado para lucir como GitHub (columnas completas)
  const weekday = new Date(today).getDay(); // 0 dom .. 6 sáb
  const end = addDays(today, 6 - weekday);  // próximo sábado (o hoy si es sábado)
  const start = addDays(end, -days + 1);

  // Inicializa buckets por día
  const map = new Map();
  for (let t = start; t <= end; t += MS_DAY) map.set(t, 0);

  // Acumula logs
  (state.logs || []).forEach(log => {
    const day = startOfDay(log.ts);
    if (map.has(day)) map.set(day, map.get(day) + 1);
  });

  // Exporta en orden día a día
  const out = [];
  for (let t = start; t <= end; t += MS_DAY) out.push({ dayTs: t, count: map.get(t) || 0 });
  return out;
}

/** Escala de niveles (0..4) según cuartiles */
function toLevel(count, max) {
  if (!count) return 0;
  const q1 = Math.max(1, Math.ceil(max * 0.25));
  const q2 = Math.max(2, Math.ceil(max * 0.5));
  const q3 = Math.max(3, Math.ceil(max * 0.75));
  if (count <= q1) return 1;
  if (count <= q2) return 2;
  if (count <= q3) return 3;
  return 4;
}

/** Renderiza el heatmap en #heatmap */
export function renderHeatmap() {
  const root = $("#heatmap");
  if (!root) return;
  clear(root);

  const data = buildBuckets(52);
  const max = data.reduce((m, d) => Math.max(m, d.count), 0);

  // Creamos una columna por día en orden (grid-auto-flow: column)
  data.forEach(({ dayTs, count }) => {
    const cell = document.createElement("div");
    const lvl = toLevel(count, max);
    cell.className = `cell${lvl ? " lv-" + lvl : ""}`;
    cell.setAttribute("role", "img");
    cell.setAttribute("aria-label", `${count} tarjetas — ${new Date(dayTs).toLocaleDateString()}`);
    cell.dataset.count = String(count);
    cell.dataset.date = new Date(dayTs).toLocaleDateString();

    root.appendChild(cell);
  });

  // Tooltip básico
  let tip = document.createElement("div");
  tip.className = "sf-tooltip";
  tip.style.display = "none";
  document.body.appendChild(tip);

  root.addEventListener("mousemove", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) { tip.style.display = "none"; return; }
    tip.textContent = `${cell.dataset.count} tarjetas — ${cell.dataset.date}`;
    tip.style.left = e.pageX + "px";
    tip.style.top = e.pageY + "px";
    tip.style.display = "block";
  });
  root.addEventListener("mouseleave", () => { tip.style.display = "none"; });
}
