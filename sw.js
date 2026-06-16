// Minimalny service worker — spełnia warunek instalowalności PWA (fetch handler)
// i daje fallback offline. Strategia network-first, by w trakcie developmentu
// (serwer przez adb reverse) świeże pliki były widoczne natychmiast, a cache
// służył tylko gdy sieci brak.
'use strict';

const CACHE = 'senior-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/192.png',
  '/icons/512.png',
  '/icons/512-maskable.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  // .catch by brak pojedynczego assetu nie wywalił instalacji w trakcie dev.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Odśwież cache w tle świeżą kopią.
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('/index.html')))
  );
});
