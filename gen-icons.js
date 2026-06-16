#!/usr/bin/env node
// Generuje ikony PWA bez żadnych zewnętrznych zależności.
// Rysuje zieloną słuchawkę telefonu (#157A36) na jasnym tle i zapisuje
// icons/192.png, icons/512.png, icons/512-maskable.png jako prawdziwe PNG
// (ręczny enkoder: filtr 0 na wiersz + zlib store + CRC32).
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---------- enkoder PNG ----------
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// rgba: Uint8Array długości w*h*4
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Każdy wiersz poprzedzony bajtem filtra 0.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy
      ? rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
      : Buffer.from(rgba.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- prosty rasterizer ----------
function makeCanvas(size) {
  return { size, data: Buffer.alloc(size * size * 4) };
}

function fill(cv, r, g, b, a) {
  for (let i = 0; i < cv.data.length; i += 4) {
    cv.data[i] = r; cv.data[i + 1] = g; cv.data[i + 2] = b; cv.data[i + 3] = a;
  }
}

function setPx(cv, x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= cv.size || y >= cv.size) return;
  const i = (y * cv.size + x) * 4;
  // alpha blend nad istniejącym
  const sa = a / 255;
  cv.data[i] = Math.round(r * sa + cv.data[i] * (1 - sa));
  cv.data[i + 1] = Math.round(g * sa + cv.data[i + 1] * (1 - sa));
  cv.data[i + 2] = Math.round(b * sa + cv.data[i + 2] * (1 - sa));
  cv.data[i + 3] = 255;
}

// Wypełnione koło (tło ikony / wyróżnik).
function disc(cv, cx, cy, rad, r, g, b) {
  const r2 = rad * rad;
  for (let y = Math.floor(cy - rad); y <= Math.ceil(cy + rad); y++) {
    for (let x = Math.floor(cx - rad); x <= Math.ceil(cx + rad); x++) {
      const dx = x - cx, dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2) {
        // antyaliasing krawędzi
        const d = Math.sqrt(d2);
        const a = Math.max(0, Math.min(1, rad - d)) * 255;
        setPx(cv, x, y, r, g, b, a);
      }
    }
  }
}

// Rysuje klasyczną słuchawkę telefonu (handset) jak ikona "zadzwoń":
// gruby wygięty uchwyt + dwie wyraźne, szersze główki (mikrofon i głośnik)
// na końcach, całość obrócona o ~ -45° (lewy-dół do prawy-góra).
function handset(cv, cx, cy, scale, r, g, b) {
  const ang = -45 * Math.PI / 180;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const rot = (lx, ly) => [lx * ca - ly * sa, lx * sa + ly * ca];

  const L = 95 * scale;     // długość połowy uchwytu
  const bow = 78 * scale;   // mocne wygięcie (głęboki łuk słuchawki)
  const barTh = 30 * scale; // grubość uchwytu
  const headR = 46 * scale; // promień główek na końcach

  // Uchwyt: parabola wygięta w dół, obrócona.
  const steps = 500;
  for (let t = 0; t <= steps; t++) {
    const u = (t / steps) * 2 - 1;        // -1..1
    const lx = u * L;
    const ly = bow * (1 - u * u);         // wybrzuszenie w dół => kształt słuchawki
    const [wx, wy] = rot(lx, ly);
    disc(cv, cx + wx, cy + wy, barTh / 2, r, g, b);
  }

  // Główki słuchawki — owalne pogrubienia na obu końcach uchwytu.
  for (const endU of [-1, 1]) {
    const lx = endU * L;
    const ly = 0; // końce paraboli (u=±1) mają ly=0
    // przesuń główkę lekko na zewnątrz wzdłuż osi uchwytu
    const ox = endU * 6 * scale;
    const [wx, wy] = rot(lx + ox, ly - 10 * scale);
    disc(cv, cx + wx, cy + wy, headR / 2, r, g, b);
  }
}

function buildIcon(size, maskable) {
  const cv = makeCanvas(size);
  // Tło: maskable wypełnia cały kwadrat zielenią (Android przytnie do kształtu),
  // zwykła ikona ma jasne tło + zielone koło, dla rozpoznawalności.
  const GREEN = [21, 122, 54];   // #157A36
  const LIGHT = [244, 245, 247]; // #F4F5F7
  const WHITE = [255, 255, 255];

  if (maskable) {
    fill(cv, GREEN[0], GREEN[1], GREEN[2], 255);
    // safe zone 80% — słuchawka biała wycentrowana, mieści się w 80% kwadratu
    handset(cv, size / 2, size / 2, (size / 512) * 0.92, WHITE[0], WHITE[1], WHITE[2]);
  } else {
    fill(cv, LIGHT[0], LIGHT[1], LIGHT[2], 255);
    // zielone koło tła
    disc(cv, size / 2, size / 2, size * 0.46, GREEN[0], GREEN[1], GREEN[2]);
    // biała słuchawka na zielonym
    handset(cv, size / 2, size / 2, (size / 512) * 1.0, WHITE[0], WHITE[1], WHITE[2]);
  }
  return encodePNG(size, size, cv.data);
}

// ---------- zapis ----------
const outDir = path.join(__dirname, 'icons');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { name: '192.png', size: 192, maskable: false },
  { name: '512.png', size: 512, maskable: false },
  { name: '512-maskable.png', size: 512, maskable: true },
];

for (const t of targets) {
  const png = buildIcon(t.size, t.maskable);
  fs.writeFileSync(path.join(outDir, t.name), png);
  console.log(`Zapisano icons/${t.name} (${png.length} B)`);
}
console.log('Gotowe.');
