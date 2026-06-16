#!/usr/bin/env node
// Minimalny serwer statyczny dla mockupu senior launchera.
// Serwuje bieżący katalog na :8080 z nagłówkami no-cache (live reload na telefonie)
// i poprawnym scope dla service workera (PWA).
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    // Zabezpieczenie przed wyjściem poza katalog projektu.
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404: ' + urlPath);
      }
      const ext = path.extname(filePath).toLowerCase();
      const headers = {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        // Brak cache — wymusza świeże pliki przy każdym odświeżeniu na telefonie.
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      };
      // Pozwól service workerowi mieć scope w root, nawet gdy leży głębiej.
      if (path.basename(filePath) === 'sw.js') {
        headers['Service-Worker-Allowed'] = '/';
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500);
    res.end('500: ' + e.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Senior launcher mockup serwowany na http://localhost:${PORT}`);
  console.log(`Katalog: ${ROOT}`);
  console.log(`Na telefonie (po 'adb reverse tcp:${PORT} tcp:${PORT}'): http://localhost:${PORT}`);
});
