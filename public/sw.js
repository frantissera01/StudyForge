// --- StudyForge Service Worker (cache + offline) ---
// Scope: se define por la ubicación del SW. Al estar en /public/sw.js,
// su scope abarcará /public/* (ideal si tu index.html vive allí).

const VERSION = "v1.0.0";
const STATIC_CACHE  = `studyforge-static-${VERSION}`;
const RUNTIME_CACHE = `studyforge-runtime-${VERSION}`;

// Archivos que queremos precachear para que la app “arranque” offline

const PRECACHE_URLS = [
  "./index.html",
  "./manifest.json",
  "./assets/favicon-32.png",
  "./assets/favicon-192.png",
  "./assets/favicon-512.png",
  "/src/app.js",
  "/src/styles/main.css",
  "/src/core/state.js",
  "/src/core/models.js",
  "/src/core/scheduler.js",
  "/src/core/storage.js",
  "/src/ui/dom.js",
  "/src/ui/sidebar.js",
  "/src/ui/deckView.js",
  "/src/ui/modals.js",
  "/src/ui/studyView.js"
];


// Helpers
const isSameOrigin = (url) => self.location.origin === new URL(url, self.location).origin;

// --- INSTALL: precache ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // activar de inmediato esta versión
});

// --- ACTIVATE: limpiar caches viejos ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Estrategias:
// - Navegaciones (HTML): network-first con fallback al cache (index).
// - Estáticos mismo origen (JS/CSS/IMG/SVG): stale-while-revalidate.
// - Terceros (CDN Bootstrap): cache-first con actualización en background.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Navegaciones (ir a páginas)
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  // 2) Misma-origen: assets
  if (isSameOrigin(url)) {
    const isAsset = /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|json)$/.test(url.pathname);
    if (isAsset) {
      event.respondWith(staleWhileRevalidate(req));
      return;
    }
  }

  // 3) Terceros (CDN)
  const isCDN = /cdn.jsdelivr.net|unpkg.com|fonts.gstatic.com|fonts.googleapis.com/.test(url.hostname);
  if (isCDN) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // 4) Default: pasar
  // (podrías agregar aquí más reglas si hiciera falta)
});

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    // (Opcional: guardar una copia)
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    // Fallback: lo que tengamos cacheado (index para SPA)
    const cacheMatch = await caches.match(request);
    return (
      cacheMatch ||
      caches.match("/public/index.html") ||
      new Response("Offline", { status: 503, statusText: "Offline" })
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((resp) => {
      // Sólo cachear respuestas válidas
      if (resp && resp.status === 200 && (resp.type === "basic" || resp.type === "opaque")) {
        cache.put(request, resp.clone());
      }
      return resp;
    })
    .catch(() => null);

  return cached || networkPromise || fetch(request).catch(() => cached);
}

// Permite “skipWaiting” desde la app si lo necesitás
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
