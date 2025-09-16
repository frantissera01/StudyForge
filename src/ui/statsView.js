// src/ui/statsView.js
import { state } from "../core/state.js";
import { $, show, hide } from "./dom.js";

let perDayChart = null;
let qualityChart = null;

function lastNDaysLabels(n = 30) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toLocaleDateString(undefined, { month: "short", day: "2-digit" }));
  }
  return out;
}

function floorDate(ts) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function buildPerDayData(n = 30) {
  const end = floorDate(Date.now());
  const start = end - (n - 1) * 24 * 60 * 60 * 1000;
  const buckets = new Map();
  for (let i = 0; i < n; i++) buckets.set(start + i * 86400000, 0);

  (state.logs || []).forEach((log) => {
    const day = floorDate(log.ts);
    if (day >= start && day <= end && buckets.has(day)) {
      buckets.set(day, buckets.get(day) + 1);
    }
  });

  return Array.from(buckets.values());
}

function buildQualityData(days = 7) {
  const cutoff = Date.now() - (days * 86400000);
  const counts = { difficult: 0, doubt: 0, easy: 0 };
  (state.logs || []).forEach((log) => {
    if (log.ts >= cutoff) {
      if (log.quality === 0) counts.difficult++;
      else if (log.quality === 1) counts.doubt++;
      else if (log.quality === 2) counts.easy++;
    }
  });
  return counts;
}

export function renderStats() {
  // Toggle vistas
  hide($("#view-deck"));
  hide($("#view-study"));
  hide($("#view-empty"));
  show($("#view-stats"));

  // Dataset
  const labels = lastNDaysLabels(30);
  const perDay = buildPerDayData(30);
  const qCounts = buildQualityData(7);

  // Charts
  const ctx1 = /** @type {HTMLCanvasElement} */ ($("#chPerDay")).getContext("2d");
  const ctx2 = /** @type {HTMLCanvasElement} */ ($("#chQuality")).getContext("2d");

  if (perDayChart) perDayChart.destroy();
  if (qualityChart) qualityChart.destroy();

  // Bar: por día
  perDayChart = new Chart(ctx1, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Tarjetas estudiadas", data: perDay }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      plugins: { legend: { display: false } }
    }
  });

  // Doughnut: calidad
  qualityChart = new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: ["Difícil (1)", "Duda (2)", "Fácil (3)"],
      datasets: [{ data: [qCounts.difficult, qCounts.doubt, qCounts.easy] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });
}
