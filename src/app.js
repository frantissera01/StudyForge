// src/app.js (orquestador simple)

// Core
import { state, load, onChange } from "./core/state.js";
import { createDeck, deleteCard } from "./core/models.js";

// UI
import { $, show, hide } from "./ui/dom.js";
import { renderSidebar, bindSidebar } from "./ui/sidebar.js";
import { renderDeckView, bindDeckHeader } from "./ui/deckView.js";
import { bindModal } from "./ui/modals.js";
import { startStudy, bindStudyUI, endStudy } from "./ui/studyView.js";
import { renderStats } from "./ui/statsView.js";
import { bindFilters } from "./ui/filters.js";


let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("btnInstall");
  if (btn) btn.classList.remove("d-none");
});

document.getElementById("btnInstall")?.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log("Install prompt:", outcome);
  deferredPrompt = null;
  document.getElementById("btnInstall")?.classList.add("d-none");
});


// src/app.js
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js") // relativo a /public/
    .then(() => console.log("Service Worker registrado ✅"))
    .catch((err) => console.error("SW error:", err));
}


// Import/Export (navbar)
function exportJSON() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "studyforge-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function importJSON(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    if (!json.decks) throw new Error("Archivo inválido");
    // Reemplazar estado sin helper para mantener dependencia mínima
    localStorage.setItem("studyforge.v1", JSON.stringify(json));
    // reload en memoria
    load();
    alert("Importado con éxito ✅");
    renderAll();
  } catch (err) {
    alert("Error al importar: " + err.message);
  }
}

function bindNavbarIO() {
  $("#btnExport")?.addEventListener("click", exportJSON);
  $("#importFile")?.addEventListener("change", (e) => importJSON(e.target.files[0]));
}

function bindStatsButtons() {
  $("#btnStats")?.addEventListener("click", () => {
    renderStats();
  });
  $("#btnBackFromStats")?.addEventListener("click", () => {
    // volver al mazo
    hide($("#view-stats"));
    show($("#view-deck"));
  });
}

// Render maestro
function renderAll() {
  renderSidebar(renderAll);
  renderDeckView();

  if (!Object.keys(state.decks).length) {
    show($("#view-empty"));
    hide($("#view-deck"));
    hide($("#view-study"));
  }
}

function init() {
  load();
  onChange(() => {}); // hook futuro si querés

  // Bind UI
  bindNavbarIO();
  bindSidebar(renderAll, createDeck);
  bindDeckHeader(() => startStudy(renderAll));
  bindModal(renderAll);
  bindStudyUI(renderAll);
  bindStatsButtons();
  bindFilters(renderAll);

  // Primer render
  renderAll();
}

window.__studyforge__ = { state, renderAll, deleteCard };
init();
