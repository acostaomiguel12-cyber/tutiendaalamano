/* TU TIENDA A LA MANO — Service Worker (PWA instalable + offline básico).
 * - Cache-first para assets propios (app shell, imágenes, CSS/JS con hash).
 * - NUNCA intercepta /api (pagos, auth, webhook siempre van a red).
 * - Network-first con fallback a caché para navegaciones (index.html).
 */
const CACHE = 'tienda-mano-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => undefined)
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
      .catch(() => undefined)
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // API y pagos: siempre red, sin caché.
  if (url.pathname.startsWith('/api')) return;

  // Solo mismo origen.
  if (url.origin !== self.location.origin) return;

  // Navegaciones: red primero, fallback a index cacheado (SPA offline).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put('/index.html', copy)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || Response.error()))
    );
    return;
  }

  // Assets: caché primero, luego red (y guarda).
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
        }
        return res;
      });
    })
  );
});
