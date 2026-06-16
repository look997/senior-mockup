'use strict';

/* =========================================================================
   Telefon Seniora — logika mockupu (vanilla JS, bez zależności).
   ========================================================================= */

// ---------------- DANE PRZYKŁADOWE ----------------
// DECYZJA PROJEKTOWA: jeden wpis = jeden numer. Kontakt z androida mający kilka
// numerów jest rozbijany na osobne wpisy z dopiskiem (np. "(komórka)" / "(dom)"),
// zamiast wyboru numeru po wybraniu osoby. Przykład: Halina Dąbrowska poniżej.
// Patrz README.md → "Jak działa?".
const contacts = [
  { name: 'Jan Kowalski',         initials: 'JK', color: 'av-blue',   phone: '+48 601 234 567', favorite: true  },
  { name: 'Anna Nowak',           initials: 'AN', color: 'av-green',  phone: '+48 602 345 678', favorite: true  },
  { name: 'Zofia Wiśniewska',     initials: 'ZW', color: 'av-red',    phone: '+48 603 456 789', favorite: false },
  { name: 'Marek Lewandowski',    initials: 'ML', color: 'av-purple', phone: '+48 604 567 890', favorite: false },
  // Dwa numery tej samej osoby = dwa osobne wpisy (jeden wpis = jeden numer):
  { name: 'Halina Dąbrowska (komórka)', initials: 'HD', color: 'av-blue', phone: '+48 605 111 222', favorite: false },
  { name: 'Halina Dąbrowska (dom)',     initials: 'HD', color: 'av-blue', phone: '+48 22 778 90 12', favorite: false },
];

function phoneOf(name) {
  const c = contacts.find((x) => x.name === name);
  return c ? c.phone : null;
}
// Rozpoznaj kontakt po wpisanym numerze (porównanie samych cyfr).
function digitsOnly(s) { return (s || '').replace(/\D/g, ''); }

// Formatuje numer: kierunkowy (+48 / 48) osobno, reszta grupowana po 3 cyfry.
function formatPhone(raw) {
  if (!raw) return '';
  const plus = /^\s*\+/.test(raw);
  let d = digitsOnly(raw);
  let prefix = '';
  if (plus && d.startsWith('48')) { prefix = '+48 '; d = d.slice(2); }
  else if (!plus && d.startsWith('48') && d.length > 9) { prefix = '+48 '; d = d.slice(2); }
  // grupuj po 3
  const groups = [];
  for (let i = 0; i < d.length; i += 3) groups.push(d.slice(i, i + 3));
  return prefix + groups.join(' ');
}
function nameForPhone(num) {
  const d = digitsOnly(num);
  if (d.length < 3) return null;
  const c = contacts.find((x) => digitsOnly(x.phone).endsWith(d) || d.endsWith(digitsOnly(x.phone)));
  return c ? c.name : null;
}
// Częściowe dopasowanie wpisywanego numeru: zwróć kontakt TYLKO gdy pasuje
// dokładnie jeden (po fragmencie cyfr numeru). Inaczej null.
function partialContactMatch(num) {
  const d = digitsOnly(num);
  if (d.length < 2) return null;
  const hits = contacts.filter((x) => digitsOnly(x.phone).includes(d));
  return hits.length === 1 ? hits[0] : null;
}

const messages = [
  {
    sender: 'Anna Nowak', initials: 'AN', color: 'av-green', phone: '+48 602 345 678',
    preview: 'Mamo, będę u Ciebie o 17:00, kupić coś po drodze?', time: '16 cze, 14:05', unread: true, mms: false,
    body: 'Mamo, będę u Ciebie o 17:00. Kupić coś po drodze? Daj znać, to wezmę chleb i mleko. Buziaki!',
  },
  {
    sender: 'Zofia Wiśniewska', initials: 'ZW', color: 'av-red', phone: '+48 603 456 789',
    preview: 'Zobacz jakie zdjęcie z wczorajszej wycieczki!', time: '16 cze, 12:30', unread: true, mms: true,
    body: 'Zobacz jakie piękne zdjęcie zrobiłam wczoraj na wycieczce! Pozdrawiam serdecznie.',
  },
  {
    sender: '+48 730 991 002', initials: '?', color: 'av-gray', phone: '+48 730 991 002', unknown: true,
    preview: 'Twoja przesyłka czeka w paczkomacie. Kod: 4821.', time: '15 cze, 16:12', unread: true, mms: false,
    body: 'Twoja przesyłka czeka w paczkomacie przy ul. Kwiatowej 3. Kod odbioru: 4821. Ważny do jutra.',
  },
  {
    sender: 'Przychodnia Zdrowie', initials: 'PZ', color: 'av-blue', phone: '+48 22 123 45 67',
    preview: 'Przypomnienie: wizyta u lekarza jutro o 9:30.', time: '15 cze, 09:00', unread: false, mms: false,
    body: 'Przypomnienie: wizyta u lekarza rodzinnego jutro o godzinie 9:30, gabinet nr 4. Prosimy o przybycie 10 minut wcześniej.',
  },
  {
    sender: 'Marek Lewandowski', initials: 'ML', color: 'av-purple', phone: '+48 604 567 890',
    preview: 'Dzień dobry, dzwoniłem wczoraj. Oddzwonię wieczorem.', time: '13 cze, 18:40', unread: false, mms: false,
    body: 'Dzień dobry, dzwoniłem wczoraj ale nie odebrałaś. Nic pilnego — oddzwonię wieczorem po 19:00. Pozdrawiam, Marek.',
  },
];

const calls = [
  { name: '+48 730 991 002', phone: '+48 730 991 002', dir: 'missed', label: 'Nieodebrane', time: '16 cze, 15:02', dur: null, handled: false, unknown: true },
  { name: 'Jan Kowalski',     phone: '+48 601 234 567', dir: 'missed', label: 'Nieodebrane', time: '16 cze, 13:48', dur: null,  handled: false },
  { name: 'Anna Nowak',       phone: '+48 602 345 678', dir: 'in',     label: 'Odebrane',    time: '16 cze, 11:20', dur: 323,   handled: true  },
  { name: 'Zofia Wiśniewska', phone: '+48 603 456 789', dir: 'out',    label: 'Wykonane',    time: '15 cze, 18:05', dur: 92,    handled: true  },
];
// Czas trwania rozmowy w czytelnym formacie ("5 min 23 s").
function durText(sec) {
  if (sec == null) return '';
  const m = Math.floor(sec / 60), s = sec % 60;
  return m > 0 ? (m + ' min ' + s + ' s') : (s + ' s');
}

// Ogólne powiadomienia (NIE wiadomości, NIE połączenia) — sterują kropką przy zasięgu.
// Symulowane przez long-press strefy baterii. Start: 0 (kropka ukryta).
let generalNotifications = 0;

// ---------------- IKONY SVG ----------------
const SVG = {
  handsetWhite:
    '<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M11 5c2 0 3 1 4 4l1 4c.4 1.6 0 2.6-1 3.6l-2 2c1.6 3.4 4 5.8 7.4 7.4l2-2c1-1 2-1.4 3.6-1l4 1c3 1 4 2 4 4 0 4-3 7-7 7C18 39 1 22 1 12 1 8 4 5 8 5z" fill="#FFFFFF"/></svg>',
  callIn:
    '<svg class="call-ico" width="40" height="40" viewBox="0 0 32 32" aria-hidden="true"><path d="M22 10L11 21" stroke="#157A36" stroke-width="3.4" stroke-linecap="round"/><path d="M11 12v9h9" fill="none" stroke="#157A36" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  callOut:
    '<svg class="call-ico" width="40" height="40" viewBox="0 0 32 32" aria-hidden="true"><path d="M10 22L21 11" stroke="#0D47A1" stroke-width="3.4" stroke-linecap="round"/><path d="M12 11h9v9" fill="none" stroke="#0D47A1" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  callMissed:
    '<svg class="call-ico" width="40" height="40" viewBox="0 0 32 32" aria-hidden="true"><path d="M11 11l10 10M21 11L11 21" stroke="#B71C1C" stroke-width="3.4" stroke-linecap="round"/></svg>',
  backspaceWhite:
    '<svg width="38" height="30" viewBox="0 0 44 36" aria-hidden="true"><path d="M16 4h22a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H16L2 18z" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linejoin="round"/><path d="M22 12l12 12M34 12L22 24" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round"/></svg>',
  lockWhite:
    '<svg width="32" height="36" viewBox="0 0 32 36" aria-hidden="true"><rect x="5" y="15" width="22" height="18" rx="4" fill="#FFFFFF"/><path d="M10 15v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#FFFFFF" stroke-width="3.4"/></svg>',
  backArrowWhite:
    '<svg width="32" height="32" viewBox="0 0 26 26" aria-hidden="true"><path d="M16 4L7 13l9 9" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  // Klawiatura telefoniczna (kropki 3x4) — biała, dla przycisku "Klawiatura"
  keypadWhite:
    '<svg width="34" height="40" viewBox="0 0 44 56" aria-hidden="true" fill="#FFFFFF"><circle cx="8" cy="8" r="5"/><circle cx="22" cy="8" r="5"/><circle cx="36" cy="8" r="5"/><circle cx="8" cy="22" r="5"/><circle cx="22" cy="22" r="5"/><circle cx="36" cy="22" r="5"/><circle cx="8" cy="36" r="5"/><circle cx="22" cy="36" r="5"/><circle cx="36" cy="36" r="5"/><circle cx="8" cy="50" r="5"/><circle cx="22" cy="50" r="5"/><circle cx="36" cy="50" r="5"/></svg>',
};
const callIcon = (dir) => dir === 'in' ? SVG.callIn : dir === 'out' ? SVG.callOut : SVG.callMissed;

// Klawisze dialera — JEDNA definicja, wspólna dla obu dialerów.
const KEYS = [
  { d: '1', l: '' },     { d: '2', l: 'ABC' }, { d: '3', l: 'DEF' },
  { d: '4', l: 'GHI' },  { d: '5', l: 'JKL' }, { d: '6', l: 'MNO' },
  { d: '7', l: 'PQRS' }, { d: '8', l: 'TUV' }, { d: '9', l: 'WXYZ' },
  { d: '*', l: '' },     { d: '0', l: '+' },   { d: '#', l: '' },
];
// Mała ikonka latarki — pokazywana na klawiszu 0 (przytrzymaj = latarka).
const FLASH_MINI = '<svg class="key-flash" width="22" height="26" viewBox="0 0 18 24" aria-hidden="true"><path d="M4 2h10l-1.5 8h3.5L7 23l2-9H3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
function buildKeypad(keypadEl) {
  keypadEl.innerHTML = KEYS.map((k) =>
    '<button class="key' + (k.d === '0' ? ' key-zero' : '') + '" data-digit="' + k.d + '">' +
    '<span class="kdigit">' + k.d + '</span>' +
    '<span class="kletters">' + k.l + '</span>' +
    (k.d === '0' ? FLASH_MINI : '') + '</button>'
  ).join('');
}
// Na klawiaturze HOME (litery ukryte) pokaż awatary ulubionych na klawiszach
// 1,2,3… — w kolejności listy ulubionych (przytrzymanie = szybkie wybieranie).
function addFavAvatarsToKeypad(keypadEl) {
  const favs = contacts.filter((c) => c.favorite);
  favs.forEach((c, i) => {
    const key = keypadEl.querySelector('.key[data-digit="' + (i + 1) + '"]');
    if (!key || i > 8) return;
    const av = document.createElement('span');
    av.className = 'key-fav ' + c.color;
    av.textContent = c.initials;
    av.title = c.name;
    key.appendChild(av);
  });
}

// ---------------- SKALOWANIE RAMKI ----------------
const device = document.getElementById('device');
function fitFrame() {
  const s = Math.min(window.innerWidth / 720, window.innerHeight / 1604);
  device.style.setProperty('--scale', String(s));
}
window.addEventListener('resize', fitFrame);
window.addEventListener('orientationchange', fitFrame);
fitFrame();

// ---------------- ZEGAR + DATA ----------------
const elClock = document.getElementById('clock');
const elDate = document.getElementById('date');
function pad2(n) { return String(n).padStart(2, '0'); }

// Krótkie nazwy dni (Pn, Wt, Śr, Cz, Pt, So, Nd) — indeks getDay() 0=niedziela.
const SHORT_DAYS = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];

function updateClock() {
  const d = new Date();
  elClock.textContent = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
function updateDate() {
  const d = new Date();
  const dm = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long' }).format(d);
  elDate.textContent = SHORT_DAYS[d.getDay()] + ', ' + dm; // np. "Wt, 16 czerwca"
}
updateClock();
updateDate();
setInterval(updateClock, 1000);
setInterval(updateDate, 60000);

// ---------------- BATERIA ----------------
const battFill = document.getElementById('batt-fill');
const battPct = document.getElementById('batt-pct');
const BATT_MAX_W = 102;
function setBattery(pct) {
  pct = Math.max(0, Math.min(100, Math.round(pct)));
  battPct.textContent = pct + '%';
  if (battFill) {
    battFill.setAttribute('width', (pct / 100 * BATT_MAX_W).toFixed(1));
    battFill.setAttribute('fill', pct <= 20 ? '#B71C1C' : '#157A36');
  }
}
if (navigator.getBattery) {
  navigator.getBattery().then((b) => {
    setBattery(b.level * 100);
    b.addEventListener('levelchange', () => setBattery(b.level * 100));
  }).catch(() => setBattery(80));
} else { setBattery(80); }

// ---------------- WIBRACJA (respektuje wyciszenie) ----------------
let muted = false;
function buzz(ms) { if (!muted && navigator.vibrate) navigator.vibrate(ms); }

// ---------------- DŹWIĘKI (Web Audio — generowane, bez plików) ----------------
let audioCtx = null;
function ac() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
// Pojedynczy ton o danej częstotliwości, czasie i głośności.
// Zwraca utworzone węzły {o, g}, by dało się go natychmiast uciszyć (dzwonek).
function tone(freq, start, dur, vol, type) {
  const c = ac(); if (!c) return null;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.value = freq;
  o.connect(g); g.connect(c.destination);
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.setValueAtTime(vol, t + dur - 0.04);
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
  return { o, g };
}
// Dźwięk nowej wiadomości — krótkie "ding-dong".
function soundMessage() {
  if (muted) return;
  tone(880, 0, 0.14, 0.25, 'sine');
  tone(660, 0.15, 0.22, 0.25, 'sine');
}
// Dzwonek połączenia — powtarzalna melodia. Trzymamy referencje do zaplanowanych
// oscylatorów (ringNodes), by stopRingtone mógł URWAĆ dźwięk NATYCHMIAST
// (samo clearInterval nie zatrzymuje już zaplanowanych przez Web Audio tonów —
// dograłyby się do końca po odebraniu/odrzuceniu).
let ringTimer = null;
let ringNodes = [];
function startRingtone() {
  if (muted) { return; }
  stopRingtone();
  const pattern = () => {
    const ns = [
      tone(1046, 0,    0.18, 0.22, 'triangle'),
      tone(1318, 0.2,  0.18, 0.22, 'triangle'),
      tone(1046, 0.4,  0.18, 0.22, 'triangle'),
      tone(1318, 0.6,  0.30, 0.22, 'triangle'),
    ];
    ns.forEach((n) => { if (n) ringNodes.push(n); });
  };
  pattern();
  ringTimer = setInterval(pattern, 1400);
}
function stopRingtone() {
  if (ringTimer) { clearInterval(ringTimer); ringTimer = null; }
  // Natychmiast wycisz i zatrzymaj wszystkie zaplanowane tony dzwonka.
  const c = audioCtx;
  const now = c ? c.currentTime : 0;
  ringNodes.forEach(({ o, g }) => {
    try {
      if (g) { g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(0, now); }
      if (o) o.stop(now);
    } catch (e) { /* już zatrzymany — ignoruj */ }
  });
  ringNodes = [];
}

// ---------------- LONG-PRESS (przytrzymanie) ----------------
// Wywołuje handler po przytrzymaniu; ustawia el.dataset.lp by zablokować klik.
function attachLongPress(el, handler, ms) {
  let timer = null;
  const start = () => { timer = setTimeout(() => { timer = null; el.dataset.lp = '1'; handler(); }, ms || 600); };
  const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
  el.addEventListener('touchstart', start, { passive: true });
  el.addEventListener('mousedown', start);
  el.addEventListener('touchend', cancel);
  el.addEventListener('touchmove', cancel);
  el.addEventListener('mouseup', cancel);
  el.addEventListener('mouseleave', cancel);
  // Po long-pressie zablokuj następujący klik (by nie odpalić nawigacji/akcji).
  el.addEventListener('click', (e) => {
    if (el.dataset.lp === '1') { e.stopImmediatePropagation(); e.preventDefault(); el.dataset.lp = '0'; }
  }, true);
}

// ---------------- LATARKA (toggle wizualny; przytrzymaj 0) ----------------
let flashOn = false;
function toggleFlash() {
  flashOn = !flashOn;
  document.querySelectorAll('.key-zero').forEach((k) => k.classList.toggle('flash-active', flashOn));
  document.documentElement.classList.toggle('flash-on', flashOn);
  buzz(flashOn ? 25 : 15);
}

// ---------------- TRYB CIEMNY (przytrzymaj strefę zasięgu) ----------------
let darkMode = false;
function toggleDark() {
  darkMode = !darkMode;
  document.documentElement.classList.toggle('dark', darkMode);
  buzz(20);
}

// ---------------- NAWIGACJA ----------------
const screens = document.querySelectorAll('.screen');
function currentScreenId() {
  const a = document.querySelector('.screen.active');
  return a ? a.id.replace('screen-', '') : 'home';
}
// Ghost-click rozwiązany u źródła przez pointerdown na przyciskach akcji
// (Zadzwoń itd.), więc globalny strażnik nie jest potrzebny — był szkodliwy
// (blokował legalne kliknięcia tuż po nawigacji).
function showScreen(id) {
  const prev = currentScreenId();
  // Opuszczając ekran połączenia przychodzącego — zawsze ucisz dzwonek
  // (np. gdy ekran zniknie z innego powodu niż Odbierz/Odrzuć).
  if (prev === 'incoming' && id !== 'incoming' && typeof stopRingtone === 'function') stopRingtone();
  screens.forEach((s) => s.classList.remove('active'));
  const target = document.getElementById('screen-' + id);
  if (target) target.classList.add('active');
  // Lista ukrytego ekranu ma wymiary 0 — przelicz kciuki suwaka po pokazaniu.
  if (typeof updateAllScrollbars === 'function') requestAnimationFrame(updateAllScrollbars);
  buzz(15);
}
document.querySelectorAll('[data-target]').forEach((el) => {
  el.addEventListener('click', () => showScreen(el.dataset.target));
});

// ---------------- T9 ----------------
const T9 = {
  a: '2', b: '2', c: '2', d: '3', e: '3', f: '3', g: '4', h: '4', i: '4',
  j: '5', k: '5', l: '5', m: '6', n: '6', o: '6', p: '7', q: '7', r: '7', s: '7',
  t: '8', u: '8', v: '8', w: '9', x: '9', y: '9', z: '9',
};
function toAscii(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L').toLowerCase();
}
// Dopasowanie po LITERACH (multi-tap wpisuje litery, nie cyfry T9).
// Dowolne słowo nazwy zaczyna się od wpisanego ciągu liter.
function nameMatches(name, typed) {
  if (!typed) return true;
  const q = toAscii(typed).trim();
  if (!q) return true;
  const words = toAscii(name).split(/\s+/);
  return words.some((w) => w.startsWith(q)) || toAscii(name).includes(q);
}

// Ucieczka znaków HTML (wstrzykujemy podświetlone fragmenty przez innerHTML).
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// Podświetla w NAZWIE litery pasujące do wpisanego ciągu (filtr kontaktów).
// toAscii zachowuje długość 1:1, więc indeks w ASCII = indeks w oryginale.
// Zaznaczamy fragment dopasowania: prefiks słowa, a jeśli go brak — pierwsze
// wystąpienie wpisanego ciągu w całej nazwie (zgodnie z logiką nameMatches).
function highlightName(name, typed) {
  if (!typed) return esc(name);
  const q = toAscii(typed).trim();
  if (!q) return esc(name);
  const a = toAscii(name);
  let start = -1;
  // 1) słowo zaczynające się od q (granica słowa: początek lub po spacji)
  let from = 0;
  while (from <= a.length - q.length) {
    const idx = a.indexOf(q, from);
    if (idx === -1) break;
    if (idx === 0 || a[idx - 1] === ' ') { start = idx; break; }
    from = idx + 1;
  }
  // 2) jeśli żadne słowo nie pasuje prefiksem — pierwsze wystąpienie gdziekolwiek
  if (start === -1) start = a.indexOf(q);
  if (start === -1) return esc(name);
  const end = start + q.length;
  return esc(name.slice(0, start)) +
    '<span class="match">' + esc(name.slice(start, end)) + '</span>' +
    esc(name.slice(end));
}
// Podświetla w SFORMATOWANYM numerze cyfry pasujące do wpisanych cyfr.
// formatPhone tylko wstawia "+48 " i spacje co 3 — iterujemy po sformatowanym
// stringu, licząc cyfry, i zaznaczamy te wewnątrz dopasowanego zakresu cyfr.
function highlightPhone(phone, typedDigits) {
  const formatted = formatPhone(phone);
  const d = digitsOnly(typedDigits);
  if (!d) return esc(formatted);
  const full = digitsOnly(phone);
  const at = full.indexOf(d);                 // gdzie w cyfrach numeru pasuje ciąg
  if (at === -1) return esc(formatted);
  const lo = at, hi = at + d.length;          // [lo, hi) — indeksy cyfr do podświetlenia
  let di = 0, out = '';
  for (const ch of formatted) {
    if (ch >= '0' && ch <= '9') {
      out += (di >= lo && di < hi) ? '<span class="match">' + ch + '</span>' : ch;
      di++;
    } else {
      out += esc(ch);                          // "+", spacje — bez zmian
    }
  }
  return out;
}

// ---------------- RENDER: KONTAKTY ----------------
let contactFilter = '';
function filteredContacts() { return contacts.filter((c) => nameMatches(c.name, contactFilter)); }

function contactCard(c, showStar) {
  const card = document.createElement('button');
  card.className = 'contact-card';
  card.innerHTML =
    '<div class="avatar ' + c.color + '">' + c.initials +
      (showStar ? '<span class="av-fav-star">★</span>' : '') + '</div>' +
    '<div class="contact-name">' + highlightName(c.name, contactFilter) + '</div>' +
    '<div class="contact-call"><div class="ico">' + SVG.handsetWhite + '</div><small>Zadzwoń</small></div>';
  card.addEventListener('click', () => { openConfirm(c.name, c.phone); buzz(20); });
  return card;
}
function renderContacts() {
  const wrap = document.getElementById('contacts-list');
  wrap.innerHTML = '';
  const list = filteredContacts();
  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:36px 24px;font-size:26px;color:#6B7280;text-align:center;font-weight:700;';
    empty.textContent = 'Brak kontaktów pasujących do wyszukiwania';
    wrap.appendChild(empty);
    refreshScrollbarById('contacts-list');
    return;
  }
  const filtering = contactFilter.trim().length > 0;
  if (!filtering) {
    // Bez filtra: ulubione na górze, BEZ nagłówków sekcji — gwiazdka w rogu awatara.
    const favs = list.filter((c) => c.favorite);
    const rest = list.filter((c) => !c.favorite);
    favs.forEach((c) => wrap.appendChild(contactCard(c, true)));
    rest.forEach((c) => wrap.appendChild(contactCard(c, false)));
  } else {
    // Podczas filtrowania: zwykła kolejność; gwiazdka nadal oznacza ulubionego.
    list.forEach((c) => wrap.appendChild(contactCard(c, c.favorite)));
  }
  refreshScrollbarById('contacts-list');
}

// Sekwencje multi-tap (cykl liter + cyfra) dla trybu filtra w Kontaktach.
// Kolejne naciśnięcia tego samego klawisza cyklują: 5 → j, k, l, ł, 5, j, ...
const CYCLE = {
  '1': ['1'],
  '2': ['a', 'b', 'c', 'ą', 'ć', '2'],
  '3': ['d', 'e', 'f', 'ę', '3'],
  '4': ['g', 'h', 'i', '4'],
  '5': ['j', 'k', 'l', 'ł', '5'],
  '6': ['m', 'n', 'o', 'ń', 'ó', '6'],
  '7': ['p', 'q', 'r', 's', 'ś', 'ź', '7'],
  '8': ['t', 'u', 'v', '8'],
  '9': ['w', 'x', 'y', 'z', 'ż', '9'],
  '0': [' ', '0'],
};

// ---------------- DIALERY (tryb 'phone' = numer; 'filter' = multi-tap T9) ----------------
document.querySelectorAll('.dialer').forEach((dialer) => {
  const mode = dialer.dataset.mode || 'phone';
  const display = dialer.querySelector('[data-role="display"]');
  const keypad = dialer.querySelector('[data-role="keypad"]');
  const redBtn = dialer.querySelector('[data-role="redaction"]');
  let value = '';

  // Stan multi-tap (tylko filter): który klawisz cyklujemy i na której pozycji.
  let lastKey = null, cycleIdx = 0, commitTimer = null;
  const COMMIT_MS = 900;

  buildKeypad(keypad);
  if (mode === 'phone') addFavAvatarsToKeypad(keypad);   // awatary ulubionych na 1,2,3…

  const wideClass = (mode === 'filter') ? 'del-btn del-wide' : 'del-btn';
  function updateRedButton() {
    redBtn.className = wideClass;
    if (value.length > 0) {
      redBtn.innerHTML = SVG.backspaceWhite + '<span>Usuń</span>';
    } else if (mode === 'phone') {
      redBtn.innerHTML = SVG.lockWhite + '<span>Zablokuj</span>';
    } else {
      // Kontakty, puste pole → "Powiadomienia" (powrót na HOME).
      redBtn.innerHTML = SVG.keypadWhite + '<span>Powiadomienia</span>';
    }
  }
  function render() {
    // W trybie telefonu formatuj numer (separator co 3 cyfry); w filtrze pokaż litery.
    display.textContent = (mode === 'phone') ? formatPhone(value) : value;
    if (mode === 'filter') { contactFilter = value; renderContacts(); }
    if (mode === 'phone') updateNumberHint(value);   // podpowiedź kontaktu nad dialerem
    updateRedButton();
  }
  function commitCycle() {
    lastKey = null; cycleIdx = 0;
    if (commitTimer) { clearTimeout(commitTimer); commitTimer = null; }
  }

  keypad.addEventListener('click', (e) => {
    const key = e.target.closest('.key');
    if (!key) return;
    const digit = key.dataset.digit;

    if (mode === 'phone') {
      if (value.length >= 18) return;
      value += digit; render(); buzz(15);
      return;
    }

    // tryb filter: multi-tap cykl liter
    const seq = CYCLE[digit];
    if (!seq) { buzz(10); return; } // np. '*' '#' w filtrze nieaktywne
    if (lastKey === digit) {
      // kolejne naciśnięcie tego samego klawisza — cykluj
      cycleIdx = (cycleIdx + 1) % seq.length;
      value = value.slice(0, -1) + seq[cycleIdx];
    } else {
      // nowy klawisz — zatwierdź poprzedni, dopisz pierwszą literę
      lastKey = digit; cycleIdx = 0;
      value += seq[0];
    }
    if (commitTimer) clearTimeout(commitTimer);
    commitTimer = setTimeout(commitCycle, COMMIT_MS);
    render(); buzz(15);
  });

  redBtn.addEventListener('click', () => {
    if (redBtn.dataset.lp === '1') { redBtn.dataset.lp = '0'; return; } // po long-pressie (Zablokuj)
    if (value.length > 0) { value = value.slice(0, -1); commitCycle(); render(); buzz(15); }
    else if (mode === 'phone') { buzz([8, 30, 8]); /* "Zablokuj" wymaga przytrzymania */ }
    else { showScreen('home'); }
  });
  // Zablokuj wymaga PRZYTRZYMANIA przycisku (gdy pole puste, tryb telefonu).
  if (mode === 'phone') {
    attachLongPress(redBtn, () => { if (!value) { lockScreen(); buzz(25); } });
  }

  const call = dialer.querySelector('[data-role="call"]');
  const numField = dialer.querySelector('.num-field');
  // Akcję wiążemy z pointerdown rozpoczętym NA przycisku — to eliminuje
  // "ghost-click", który po zmianie ekranu (np. powrót Klawiaturą) trafiałby
  // w Zadzwoń. Ghost-click to tylko 'click' bez własnego 'pointerdown'.
  let callArmed = false;
  if (call) {
    call.addEventListener('pointerdown', () => { callArmed = true; });
    call.addEventListener('click', () => {
      if (call.dataset.lp === '1') { call.dataset.lp = '0'; callArmed = false; return; }
      if (!callArmed) return;          // klik bez pointerdown na tym przycisku → ignoruj
      callArmed = false;
      if (mode !== 'phone') return;
      if (!value) {
        numField.classList.remove('flash');
        void numField.offsetWidth;     // restart animacji
        numField.classList.add('flash');
        buzz([10, 30, 10]);
        return;
      }
      openConfirm(null, value);
      buzz(20);
    });
  }

  // Long-press przycisku Zadzwoń (na HOME) = symulacja połączenia PRZYCHODZĄCEGO.
  if (call && mode === 'phone') {
    attachLongPress(call, () => simulateIncoming());
  }

  // Long-press klawisza 0 = latarka (na obu dialerach).
  const zeroKey = keypad.querySelector('.key-zero');
  if (zeroKey) attachLongPress(zeroKey, () => toggleFlash());

  // Long-press klawiszy 1-9 na HOME = szybkie wybieranie ulubionych (po kolei z listy).
  if (mode === 'phone') {
    keypad.querySelectorAll('.key').forEach((key) => {
      const d = key.dataset.digit;
      if (d >= '1' && d <= '9') {
        attachLongPress(key, () => {
          const favs = contacts.filter((c) => c.favorite);
          const fav = favs[parseInt(d, 10) - 1];
          if (fav) openConfirm(fav.name, fav.phone);
          else buzz([10, 30, 10]);   // brak ulubionego pod tym numerem
        });
      }
    });
  }

  updateRedButton();
});

// ---------------- EKRAN BLOKADY ----------------
function lockScreen() {
  document.documentElement.classList.add('locked');   // pasek statusu na ciemno
  showScreen('lock');
}
function unlockScreen() {
  document.documentElement.classList.remove('locked');
  showScreen('home'); buzz([20, 40]);
}
// Odblokowanie przez PRZECIĄGNIĘCIE w górę — kłódka jedzie z palcem.
(function () {
  const lock = document.getElementById('screen-lock');
  const content = lock.querySelector('.lock-content');
  let sy = null, dy = 0;
  const begin = (y) => { sy = y; dy = 0; content.style.transition = 'none'; };
  const move = (y) => {
    if (sy === null) return;
    dy = Math.max(0, sy - y);                       // ile w górę
    content.style.transform = 'translateY(' + (-Math.min(dy, 300)) + 'px)';
    content.style.opacity = String(1 - Math.min(dy, 300) / 360);
  };
  const end = () => {
    if (sy === null) return;
    const done = dy >= 90;
    content.style.transition = 'transform .2s, opacity .2s';
    content.style.transform = ''; content.style.opacity = '';
    sy = null;
    if (done) unlockScreen();
  };
  lock.addEventListener('touchstart', (e) => begin(e.touches[0].clientY), { passive: true });
  lock.addEventListener('touchmove', (e) => move(e.touches[0].clientY), { passive: true });
  lock.addEventListener('touchend', end);
  lock.addEventListener('mousedown', (e) => begin(e.clientY));
  window.addEventListener('mousemove', (e) => { if (sy !== null) move(e.clientY); });
  window.addEventListener('mouseup', end);
})();

// ---------------- OVERLAY POTWIERDZENIA (z numerem telefonu) ----------------
const overlay = document.getElementById('call-confirm');
const confirmText = document.getElementById('confirm-text');
const confirmAvatar = document.getElementById('confirm-avatar');
let pendingCallName = null;
let pendingCallRef = null;   // jeśli dzwonimy z karty nieodebranego — by oznaczyć obsłużone

// name + phone: pokaż nazwę i numer. Sam numer wpisany: pokaż numer.
// callRef (opcjonalnie): obiekt z calls[], by "Nie dzwoń" też go oznaczył jako obejrzany.
const historyBtn = overlay.querySelector('[data-role="show-history"]');
let confirmContactName = null;   // znana osoba (do etykiety powrotu)
let confirmHistName = null;      // nazwa LUB numer rozmówcy — do historii (też nieznany)
let confirmHistPhone = null;     // numer rozmówcy — do historii (dopasowanie po numerze)
let confirmOpenedFrom = 'home';  // z którego ekranu otwarto potwierdzenie
function openConfirm(name, phone, callRef, opts) {
  pendingCallRef = callRef || null;
  confirmContactName = null;
  confirmHistName = null; confirmHistPhone = null;
  // Źródło zwykle = bieżący ekran; opts.from nadpisuje (np. 'notif' — powiadomienie,
  // które mieszka na HOME, ale powrót ma wracać "do Powiadomień").
  confirmOpenedFrom = (opts && opts.from) || currentScreenId();
  if (name) {
    pendingCallName = name;
    const ph = phone || phoneOf(name);
    confirmText.innerHTML = 'Zadzwonić do<br><b>' + name + '?</b>' +
      (ph ? '<br><span class="confirm-phone">' + formatPhone(ph) + '</span>' : '');
    if (contacts.some((c) => c.name === name)) confirmContactName = name;
    confirmHistName = name; confirmHistPhone = ph || null;
  } else if (phone) {
    // Jeśli wpisany numer pasuje do kontaktu — pokaż też nazwę.
    const known = nameForPhone(phone);
    pendingCallName = known || formatPhone(phone);
    confirmText.innerHTML = known
      ? 'Zadzwonić do<br><b>' + known + '?</b><br><span class="confirm-phone">' + formatPhone(phone) + '</span>'
      : 'Zadzwonić pod numer<br><b>' + formatPhone(phone) + '</b>?';
    if (known) confirmContactName = known;
    confirmHistName = known || formatPhone(phone); confirmHistPhone = phone;
  } else {
    pendingCallName = null;
    confirmText.textContent = 'Najpierw wpisz numer.';
  }
  // Awatar rozmówcy: znany kontakt → jego inicjały/kolor; nieznany numer → "?" na szaro;
  // brak osoby (komunikat "wpisz numer") → ukryty.
  if (confirmAvatar) {
    if (name || phone) {
      const a = confirmContactName ? avatarFor(confirmContactName) : { initials: '?', color: 'av-gray' };
      confirmAvatar.className = 'avatar ' + a.color;
      confirmAvatar.textContent = a.initials;
      confirmAvatar.hidden = false;
    } else {
      confirmAvatar.hidden = true;
    }
  }
  // Pozycja "Połączenia z tym numerem" — ZAWSZE gdy dzwonimy do kogoś/pod numer
  // (pusta historia pokaże "Brak wcześniejszych połączeń"); ukryta tylko dla "wpisz numer".
  historyBtn.hidden = !(confirmHistPhone || confirmHistName);
  overlay.classList.remove('hidden');
}
function closeConfirm() {
  overlay.classList.add('hidden');
  // "Nie dzwoń"/anuluj na nieodebranym = i tak obejrzane → odznacz.
  if (pendingCallRef) { pendingCallRef.handled = true; updateBadges(); renderCalls(); pendingCallRef = null; }
}
overlay.querySelector('[data-role="cancel"]').addEventListener('click', closeConfirm);
function confirmAndCall(video) {
  if (pendingCallRef) { pendingCallRef.handled = true; updateBadges(); renderCalls(); }
  const name = pendingCallName; pendingCallRef = null;
  closeConfirm();
  if (name) startCall(name, { video: !!video });
}
overlay.querySelector('[data-role="confirm-call"]').addEventListener('click', () => confirmAndCall(false));
overlay.querySelector('[data-role="confirm-video"]').addEventListener('click', () => confirmAndCall(true));
// (Świadomie BEZ zamykania kliknięciem w tło — mylące. Zamyka tylko przycisk.)

// Historia połączeń z danym kontaktem (syntetyczna dla mockupu).
// [kierunek, etykieta, data, czas_trwania_w_sekundach (null dla nieodebranych)]
const CONTACT_HISTORY = {
  'Jan Kowalski':     [['missed','Nieodebrane','16 cze 2026, 13:48', null],['out','Wykonane','15 cze 2026, 09:12', 248],['in','Odebrane','13 cze 2026, 20:31', 512]],
  'Anna Nowak':       [['in','Odebrane','16 cze 2026, 11:20', 323],['out','Wykonane','15 cze 2026, 17:44', 78],['in','Odebrane','14 cze 2026, 08:05', 145]],
  'Zofia Wiśniewska': [['out','Wykonane','15 cze 2026, 18:05', 92],['missed','Nieodebrane','12 cze 2026, 14:50', null]],
  'Marek Lewandowski':[['out','Wykonane','11 cze 2026, 12:33', 401],['in','Odebrane','10 cze 2026, 19:18', 63]],
};
// Scala historię połączeń z daną osobą/numerem: realne wpisy z globalnej listy
// `calls` (dopasowanie po numerze) + syntetyczna baza CONTACT_HISTORY[name].
// Zwraca [{dir, label, time, dur}] posortowane malejąco (najświeższe na górze).
// Sortowanie po monotonicznym kluczu, NIE po dacie (dwa formaty etykiet czasu;
// to wystarcza dla makiety): wpisy z `calls` (zawsze "dziś/teraz") nad bazą.
function getContactHistory(name, phone) {
  const want = digitsOnly(phone || phoneOfName(name) || '');
  const out = [];
  if (want) {
    calls.forEach((c, i) => {
      if (digitsOnly(c.phone) === want) {
        out.push({ dir: c.dir, label: c.label, time: c.time, dur: c.dur, _sort: 2000000 - i });
      }
    });
  }
  (CONTACT_HISTORY[name] || []).forEach((row, i) => {
    const [dir, label, time, dur] = row;
    out.push({ dir, label, time, dur, _sort: 1000000 - i });
  });
  out.sort((a, b) => b._sort - a._sort);
  return out;
}
function renderContactHistory(name, phone) {
  // Tytuł i etykieta w kartach: znany kontakt → nazwa; nieznany numer → numer.
  const known = contacts.some((c) => c.name === name);
  const display = known ? name : (formatPhone(phone) || name);
  document.getElementById('contact-history-title').textContent = 'Połączenia: ' + display;
  const wrap = document.getElementById('contact-history-list');
  wrap.innerHTML = '';
  const list = getContactHistory(name, phone);
  if (!list.length) {
    const e = document.createElement('div');
    e.style.cssText = 'padding:40px 24px;font-size:28px;color:#6B7280;text-align:center;font-weight:700;';
    e.textContent = 'Brak wcześniejszych połączeń';
    wrap.appendChild(e); refreshScrollbarById('contact-history-list'); return;
  }
  list.forEach(({ dir, label, time, dur }) => {
    const card = document.createElement('div');
    card.className = 'call-card' + (dir === 'missed' ? ' missed' : '');
    const dirClass = dir === 'in' ? 'dir-in' : dir === 'out' ? 'dir-out' : 'dir-missed';
    const durInline = dur != null ? ' · <span class="call-dur">' + durText(dur) + '</span>' : '';
    card.innerHTML = callIcon(dir) +
      '<div class="call-info"><div class="call-name">' + display + '</div>' +
      '<div class="call-dir-label ' + dirClass + '">' + label + durInline + '</div></div>' +
      '<div class="call-time">' + time + '</div>';
    wrap.appendChild(card);
  });
  refreshScrollbarById('contact-history-list');
}
let historyBackTarget = 'contacts';
const historyBackBtn = document.querySelector('#screen-contact-history .keyboard-btn');
const historyBackLabel = document.getElementById('history-back-label');
historyBtn.addEventListener('click', () => {
  if (!confirmHistName && !confirmHistPhone) return;
  // Zapamiętaj skąd otwarto potwierdzenie, by wrócić tam. Powiadomienia mieszkają
  // na HOME — wracamy więc na ekran 'home', ale z etykietą "Powiadomienia".
  // historyBackTarget = ID EKRANU dla showScreen; etykieta liczona osobno.
  const SRC = (confirmOpenedFrom === 'calls' || confirmOpenedFrom === 'message'
            || confirmOpenedFrom === 'notif') ? confirmOpenedFrom : 'contacts';
  const BACK_SCREEN = { calls: 'calls', message: 'message', notif: 'home', contacts: 'contacts' };
  const BACK_LABELS = { calls: 'Połączenia', message: 'Wiadomość', notif: 'Powiadomienia', contacts: 'Kontakty' };
  historyBackTarget = BACK_SCREEN[SRC];
  if (historyBackLabel) historyBackLabel.textContent = BACK_LABELS[SRC];
  overlay.classList.add('hidden');   // zamknij potwierdzenie bez oznaczania
  pendingCallRef = null;
  renderContactHistory(confirmHistName, confirmHistPhone);
  showScreen('contact-history');
});
// Dolny przycisk historii wraca do źródła (kontakty/połączenia).
historyBackBtn.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  showScreen(historyBackTarget);
}, true);

// ---------------- ROZMOWA (aktywne połączenie) ----------------
const incallName = document.getElementById('incall-name');
const incallAvatar = document.getElementById('incall-avatar');
const incallTimer = document.getElementById('incall-timer');
const incallStatus = document.getElementById('incall-status');
const speakerBtn = document.getElementById('speaker-btn');
const videoRemoteAvatar = document.getElementById('video-remote-avatar');
const videoRemoteName = document.getElementById('video-remote-name');
let callTimerId = null, callConnectTimer = null, callSeconds = 0;
let screenBeforeCall = 'home', currentCallName = null, speakerOn = false;
let currentCallDir = 'out';   // kierunek bieżącej rozmowy: 'out' (my dzwonimy) | 'in' (odebrana)

function initialsFor(name) {
  const c = contacts.find((x) => x.name === name);
  if (c) return c.initials;
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (/[A-Za-zĄĆĘŁŃÓŚŹŻ]/.test(name)) return name.slice(0, 2).toUpperCase();
  return '☎';
}
function avatarColorFor(name) {
  const c = contacts.find((x) => x.name === name);
  return c ? c.color : 'av-blue';
}
// Awatar (inicjały + kolor) dla dowolnej nazwy/numeru — spójnie wszędzie:
// znany kontakt → jego inicjały i kolor; numer spoza kontaktów → "?" na szaro.
function avatarFor(name) {
  const c = contacts.find((x) => x.name === name);
  if (c) return { initials: c.initials, color: c.color };
  return { initials: '?', color: 'av-gray' };
}
// Mały kawałek HTML awatara (do wstawiania w kartach).
function avatarHTML(name, extraClass) {
  const a = avatarFor(name);
  return '<span class="avatar ' + a.color + (extraClass ? ' ' + extraClass : '') + '">' + a.initials + '</span>';
}

const incallPhone = document.getElementById('incall-phone');
function phoneOfName(name) {
  const c = contacts.find((x) => x.name === name);
  return c ? c.phone : null;
}
// opts: { video: true → od razu wideo; incoming: true → odbieramy (bez fazy nawiązywania).
function startCall(name, opts) {
  opts = opts || {};
  if (currentScreenId() !== 'incall' && currentScreenId() !== 'video' && currentScreenId() !== 'incoming') {
    screenBeforeCall = currentScreenId();
  }
  currentCallName = name;
  currentCallDir = opts.incoming ? 'in' : 'out';   // 'in' = odbieramy, 'out' = my dzwonimy
  incallName.textContent = name;
  if (incallPhone) incallPhone.textContent = formatPhone(phoneOfName(name)) || '';
  incallAvatar.className = 'incall-avatar avatar ' + avatarColorFor(name);
  incallAvatar.textContent = initialsFor(name);
  callSeconds = 0; incallTimer.textContent = '00:00';
  speakerOn = false; speakerBtn.classList.remove('on');

  function connected() {
    incallStatus.textContent = 'Trwa połączenie';
    incallTimer.style.visibility = 'visible';
    callTimerId = setInterval(() => {
      callSeconds++;
      const t = pad2(Math.floor(callSeconds / 60)) + ':' + pad2(callSeconds % 60);
      incallTimer.textContent = t;
      const vt = document.getElementById('video-timer'); if (vt) vt.textContent = t;
    }, 1000);
    if (opts.video) goVideo();
  }

  if (callTimerId) { clearInterval(callTimerId); callTimerId = null; }
  if (callConnectTimer) clearTimeout(callConnectTimer);

  if (opts.incoming) {
    // ODBIERAMY — od razu trwa połączenie, BEZ fazy nawiązywania.
    showScreen('incall'); buzz([20, 60, 20]);
    connected();
  } else {
    // MY dzwonimy — faza "Nawiązywanie połączenia…" przez ~2s.
    incallStatus.textContent = 'Nawiązywanie połączenia…';
    incallTimer.style.visibility = 'hidden';
    showScreen('incall'); buzz([20, 60, 20]);
    callConnectTimer = setTimeout(connected, 2000);
  }
}
function endCall() {
  if (callTimerId) { clearInterval(callTimerId); callTimerId = null; }
  if (callConnectTimer) { clearTimeout(callConnectTimer); callConnectTimer = null; }
  // Dopisz zakończoną rozmowę do historii: wychodzącą (out) lub odebraną (in).
  if (currentCallName) {
    logCall({ name: currentCallName, phone: phoneOfName(currentCallName), dir: currentCallDir, dur: callSeconds });
    currentCallName = null;
  }
  buzz(30);
  showScreen(screenBeforeCall || 'home');
}
function goVideo() {
  videoRemoteAvatar.className = 'video-remote-avatar avatar ' + avatarColorFor(currentCallName);
  videoRemoteAvatar.textContent = initialsFor(currentCallName);
  videoRemoteName.textContent = currentCallName || '';
  const vp = document.getElementById('video-phone');
  if (vp) vp.textContent = formatPhone(phoneOfName(currentCallName)) || '';
  const vt = document.getElementById('video-timer');
  if (vt) vt.textContent = pad2(Math.floor(callSeconds / 60)) + ':' + pad2(callSeconds % 60);
  showScreen('video'); buzz(20);
}
function goAudio() { showScreen('incall'); buzz(15); }

// Oba przyciski Rozłącz (rozmowa głosowa i wideo).
document.querySelectorAll('[data-role="hangup"]').forEach((b) => b.addEventListener('click', endCall));
// Głośnomówiący — toggle.
speakerBtn.addEventListener('click', () => {
  speakerOn = !speakerOn;
  speakerBtn.classList.toggle('on', speakerOn);
  buzz(15);
});
// Przełącz na wideo / z powrotem na głos.
document.querySelector('[data-role="to-video"]').addEventListener('click', goVideo);
document.querySelector('[data-role="to-audio"]').addEventListener('click', goAudio);

// ---------------- RENDER: WIADOMOŚCI (grupy: nieprzeczytane | przeczytane) ----------------
function msgCardHTML(m) {
  return '<span class="avatar ' + (m.color || 'av-gray') + '">' + (m.initials || '?') + '</span>' +
    '<div class="msg-body">' +
      '<div class="msg-time">' + m.time + '</div>' +
      '<div class="msg-sender">' + m.sender + '</div>' +
      '<div class="msg-preview">' + (m.mms ? '<span class="msg-mms-tag">[MMS]</span>' : '') + m.preview + '</div>' +
    '</div>' +
    (m.unread ? '<div class="card-corner"></div>' : '');
}
function renderInbox() {
  const wrap = document.getElementById('inbox-list');
  wrap.innerHTML = '';
  const unread = messages.filter((m) => m.unread);
  const read = messages.filter((m) => !m.unread);

  unread.forEach((m) => {
    const card = document.createElement('button');
    card.className = 'msg-card unread';
    card.innerHTML = msgCardHTML(m);
    card.addEventListener('click', () => openMessage(messages.indexOf(m)));
    wrap.appendChild(card);
  });

  // Etykieta "Przeczytane" pozostaje ZAWSZE, gdy są jakieś przeczytane —
  // także gdy nie ma żadnej nieprzeczytanej.
  if (read.length) {
    const div = document.createElement('div');
    div.className = 'inbox-divider';
    div.textContent = 'Przeczytane';
    if (!unread.length) div.classList.add('first');
    wrap.appendChild(div);
  }

  read.forEach((m) => {
    const card = document.createElement('button');
    card.className = 'msg-card read';
    card.innerHTML = msgCardHTML(m);
    card.addEventListener('click', () => openMessage(messages.indexOf(m)));
    wrap.appendChild(card);
  });
  refreshScrollbarById('inbox-list');
}

// ---------------- POJEDYNCZA WIADOMOŚĆ ----------------
const msgAvatar = document.getElementById('message-avatar');
const msgSender = document.getElementById('message-sender');
const msgPhone = document.getElementById('message-phone');
const msgTime = document.getElementById('message-time');
const msgText = document.getElementById('message-text');
const msgMms = document.getElementById('message-mms');
const msgCallBtn = document.getElementById('message-call');
const msgReadBtn = document.getElementById('message-read');
let openMessageSender = null;
let openedFromNotif = false;   // czy weszliśmy w wiadomość z powiadomienia

function openMessage(i, fromNotif) {
  const m = messages[i];
  openedFromNotif = !!fromNotif;
  msgAvatar.className = 'avatar ' + (m.color || 'av-blue');
  msgAvatar.textContent = m.initials || '?';
  msgSender.textContent = m.sender;
  msgPhone.textContent = formatPhone(m.phone) || '';
  msgTime.textContent = m.time;
  msgText.textContent = m.body || m.preview;
  msgMms.hidden = !m.mms;          // pokaż załącznik MMS tylko dla MMS
  openMessageSender = m.sender;
  if (m.unread) { m.unread = false; updateBadges(); renderInbox(); }
  removeMsgNotif(m);   // odczyt (z listy lub powiadomienia) zdejmuje ją z powiadomień
  showScreen('message');
}
msgCallBtn.addEventListener('click', () => {
  if (openMessageSender) { openConfirm(openMessageSender, phoneOf(openMessageSender)); buzz(20); }
});
// "Przeczytane": z powiadomienia → pokaż NASTĘPNE powiadomienie; inaczej → lista.
msgReadBtn.addEventListener('click', (e) => {
  if (openedFromNotif) {
    e.stopImmediatePropagation();   // zablokuj domyślne data-target="messages"
    openedFromNotif = false;
    showScreen('home');
    renderTopNotif();
  }
  // jeśli nie z powiadomienia: data-target="messages" zadziała normalnie (lista)
}, true);

// ---------------- RENDER: OSTATNIE POŁĄCZENIA (nowe nieobejrzane | reszta) ----------------
function callCard(c) {
  const card = document.createElement('button');
  card.className = 'call-card' + (c.dir === 'missed' ? ' missed' : '');
  const dirClass = c.dir === 'in' ? 'dir-in' : c.dir === 'out' ? 'dir-out' : 'dir-missed';
  // Kierunek + czas trwania w JEDNYM rzędzie: "Odebrane · 5 min 23 s".
  const durInline = c.dur != null ? ' · <span class="call-dur">' + durText(c.dur) + '</span>' : '';
  card.innerHTML =
    callIcon(c.dir) +
    '<div class="call-info"><div class="call-name">' + c.name + '</div>' +
    '<div class="call-dir-label ' + dirClass + '">' + c.label + durInline + '</div></div>' +
    '<div class="call-time">' + c.time + '</div>' +
    (c.dir === 'missed' && !c.handled ? '<div class="card-corner"></div>' : '');
  // klik = wejście w kartę: dla nieodebranego to już "obejrzane"
  card.addEventListener('click', () => { openConfirm(c.name, c.phone, c.dir === 'missed' ? c : null); buzz(20); });
  return card;
}
function renderCalls() {
  const wrap = document.getElementById('calls-list');
  wrap.innerHTML = '';
  // Nowe = nieodebrane jeszcze nieobejrzane; reszta = obejrzane/odebrane/wykonane.
  const fresh = calls.filter((c) => c.dir === 'missed' && !c.handled);
  const rest = calls.filter((c) => !(c.dir === 'missed' && !c.handled));
  fresh.forEach((c) => wrap.appendChild(callCard(c)));
  // Etykieta "Sprawdzone" pozostaje ZAWSZE, gdy są takie połączenia — obejmuje
  // odebrane/wykonane ORAZ nieodebrane już obejrzane (nic nie wymaga uwagi).
  if (rest.length) {
    const div = document.createElement('div');
    div.className = 'inbox-divider';
    div.textContent = 'Sprawdzone';
    if (!fresh.length) div.classList.add('first');
    wrap.appendChild(div);
  }
  rest.forEach((c) => wrap.appendChild(callCard(c)));
  refreshScrollbarById('calls-list');
}

// ---------------- WYCISZ (przełącza przekreślony / nieprzekreślony głośnik) ----------------
const muteTile = document.getElementById('mute-tile');
const muteLabel = document.getElementById('mute-label');
function clickMute() {
  muted = !muted;
  // Klasa 'muted' na kaflu steruje widocznością fal i przekreślenia (CSS).
  muteTile.classList.toggle('muted', muted);
  muteTile.classList.toggle('on', muted);
  muteLabel.textContent = muted ? 'Odcisz' : 'Wycisz';   // napis zależny od stanu
  if (!muted && navigator.vibrate) navigator.vibrate(25);
}

// ---------------- OZNACZENIA W ROGU KAFLI + KROPKA POWIADOMIEŃ ----------------
function updateBadges() {
  const unread = messages.filter((m) => m.unread).length;
  const msgCorner = document.getElementById('msg-corner');
  if (unread > 0) { msgCorner.textContent = String(unread); msgCorner.hidden = false; }
  else { msgCorner.hidden = true; }

  const missed = calls.filter((c) => c.dir === 'missed' && !c.handled).length;
  const callsCorner = document.getElementById('calls-corner');
  if (missed > 0) { callsCorner.textContent = String(missed); callsCorner.hidden = false; }
  else { callsCorner.hidden = true; }

  // Kropka ogólnych powiadomień przy oczku.
  document.getElementById('notif-dot').hidden = generalNotifications <= 0;
}

// ---------------- POPUPY POWIADOMIEŃ (nad dialerem na HOME) ----------------
// Kolejka: pokazujemy JEDEN popup naraz (najnowszy). Nie znika, dopóki nie zareagujesz.
const notifStack = document.getElementById('notif-stack');
const notifQueue = []; // {type:'msg'|'call', ref, count}

// Tworzy kartę najnowszego powiadomienia (msg/call). Zwraca element albo null.
function buildTopNotifCard() {
  if (notifQueue.length === 0) return null;
  const n = notifQueue[notifQueue.length - 1]; // najnowszy
  const card = document.createElement('div');
  card.className = 'notif-card ' + (n.type === 'msg' ? 'msg' : 'call');
  const more = notifQueue.length > 1 ? '<span class="notif-count">+' + (notifQueue.length - 1) + ' więcej</span>' : '';
  if (n.type === 'msg') {
    const m = n.ref;
    card.innerHTML =
      '<div class="notif-head"><span class="notif-kind">Wiadomość</span>' +
        '<span class="notif-time">' + m.time + '</span>' + more + '</div>' +
      '<div class="notif-from"><span class="avatar ' + (m.color || 'av-gray') + '">' + (m.initials || '?') + '</span>' + m.sender + '</div>' +
      '<div class="notif-preview">' + (m.mms ? '[MMS] ' : '') + m.preview + '</div>' +
      '<div class="notif-actions">' +
        '<button class="notif-green" data-act="read">CZYTAJ</button>' +
        '<button class="notif-red" data-act="dismiss">Przeczytane</button>' +
      '</div>';
    card.querySelector('[data-act="read"]').addEventListener('click', () => {
      // openMessage sam zdejmie tę wiadomość z powiadomień (removeMsgNotif).
      openMessage(messages.indexOf(m), true);
    });
    card.querySelector('[data-act="dismiss"]').addEventListener('click', () => {
      m.unread = false; updateBadges(); renderInbox();
      removeMsgNotif(m); buzz(15);
    });
  } else {
    const c = n.ref;
    card.innerHTML =
      '<div class="notif-head"><span class="notif-kind">Nieodebrane połączenie</span>' + more + '</div>' +
      '<div class="notif-from">' + avatarHTML(c.name) + c.name + '</div>' +
      '<div class="notif-preview">' + formatPhone(c.phone) + ' · ' + c.time + '</div>' +
      '<div class="notif-actions">' +
        '<button class="notif-green" data-act="callback">ODDZWOŃ</button>' +
        '<button class="notif-red" data-act="reject">Odrzuć</button>' +
      '</div>';
    card.querySelector('[data-act="callback"]').addEventListener('click', () => {
      c.handled = true; updateBadges(); renderCalls();
      notifQueue.pop(); renderNotifStack();
      openConfirm(c.name, c.phone, null, { from: 'notif' });   // powrót: "Powiadomienia" (HOME)
    });
    card.querySelector('[data-act="reject"]').addEventListener('click', () => {
      c.handled = true; updateBadges(); renderCalls();
      notifQueue.pop(); renderNotifStack(); buzz(15);
    });
  }
  return card;
}

const hintLayer = document.getElementById('notif-hint');
let currentHintMatch = null;
// Ile powiadomień było w kolejce w chwili, gdy pojawiło się dopasowanie numeru.
// Tylko powiadomienia DODANE PÓŹNIEJ (świeższe) przykrywają dopasowanie.
// null = dopasowanie nieaktywne (zwykły tryb powiadomień).
let hintBaseline = null;

// Wpisany numer w chwili dopasowania — by podświetlić pasujące cyfry na karcie.
let currentHintTyped = '';
// Buduje kartę info o dopasowaniu numeru (pasujące cyfry innym odcieniem).
function hintCardHTML(match) {
  return '<div class="notif-card hint">' +
    '<div class="notif-head"><span class="notif-kind">Dopasowano do wpisywanego numeru</span></div>' +
    '<div class="notif-from"><span class="hint-avatar ' + match.color + '">' + match.initials + '</span>' + esc(match.name) + '</div>' +
    '<div class="notif-preview">' + highlightPhone(match.phone, currentHintTyped) + '</div></div>';
}

// MODEL — JEDEN obszar, jak dawniej:
//  - Brak dopasowania → zwykły stos powiadomień (najnowsze widoczne).
//  - Dopasowanie aktywne, BRAK świeższych powiadomień → widać DOPASOWANIE
//    (ZAMIAST powiadomień; istniejące „starsze" są przykryte/uśpione).
//  - Dopasowanie aktywne + przyszło NOWE powiadomienie → ono (świeższe = priorytet)
//    pokazuje się NAD dopasowaniem.
//  - Odhaczysz wszystkie świeże powiadomienia → wraca dopasowanie.
function renderNotifStack() {
  notifStack.innerHTML = '';

  // Liczba powiadomień "świeższych niż dopasowanie" (dodanych po jego pojawieniu).
  const freshCount = (hintBaseline === null) ? notifQueue.length
                                             : Math.max(0, notifQueue.length - hintBaseline);

  if (currentHintMatch && freshCount === 0) {
    // Dopasowanie przejmuje obszar — ZAMIAST powiadomień (jak dawniej).
    notifStack.innerHTML = hintCardHTML(currentHintMatch);
  } else if (notifQueue.length > 0) {
    // Widać najnowsze powiadomienie (świeższe = priorytet, nad dopasowaniem).
    const top = buildTopNotifCard();
    if (top) notifStack.appendChild(top);
  }
}
function renderTopNotif() { renderNotifStack(); }

function pushMsgNotif(m) { notifQueue.push({ type: 'msg', ref: m }); renderNotifStack(); buzz([20, 40, 20]); soundMessage(); }
function pushCallNotif(c) { notifQueue.push({ type: 'call', ref: c }); renderNotifStack(); buzz([20, 40, 20]); }
// Usuń z kolejki powiadomień wpis wskazujący na daną wiadomość (po referencji,
// niezależnie od pozycji). Dzięki temu odczyt wiadomości — czy to z panelu
// powiadomień, czy z listy Wiadomości — zawsze ją z powiadomień zdejmuje.
function removeMsgNotif(m) {
  const i = notifQueue.findIndex((n) => n.type === 'msg' && n.ref === m);
  if (i !== -1) { notifQueue.splice(i, 1); renderNotifStack(); }
}

// Podpowiedź kontaktu przy wpisywaniu numeru.
function updateNumberHint(value) {
  const prev = currentHintMatch;
  currentHintTyped = value || '';
  currentHintMatch = value ? partialContactMatch(value) : null;
  if (currentHintMatch && !prev) {
    // Dopasowanie właśnie się pojawiło — zapamiętaj ile powiadomień już było.
    // Tylko te dodane PÓŹNIEJ przykryją dopasowanie.
    hintBaseline = notifQueue.length;
  } else if (!currentHintMatch) {
    hintBaseline = null;   // dopasowanie zniknęło → zwykły tryb powiadomień
  }
  renderNotifStack();
}

// Pule symulowanych nadawców/dzwoniących (mix kontaktów i numerów spoza listy).
const SIM_SENDERS = [
  { sender: 'Anna Nowak', initials: 'AN', color: 'av-green', phone: '+48 602 345 678',
    preview: 'Dzięki za pomoc wczoraj! Do zobaczenia.', body: 'Dzięki za pomoc wczoraj! Bardzo mi pomogłaś. Do zobaczenia w sobotę.', mms: false },
  { sender: '+48 511 882 030', initials: '?', color: 'av-gray', phone: '+48 511 882 030', unknown: true,
    preview: 'Rabat -20% tylko dziś w naszej aptece!', body: 'Rabat -20% tylko dziś w naszej aptece. Zapraszamy! Aby zrezygnować, wyślij STOP.', mms: false },
  { sender: 'Marek Lewandowski', initials: 'ML', color: 'av-purple', phone: '+48 604 567 890',
    preview: 'Zobacz to zdjęcie z działki 🌷', body: 'Zobacz jakie kwiaty wyrosły na działce! Pozdrawiam.', mms: true },
  { sender: '+48 720 145 900', initials: '?', color: 'av-gray', phone: '+48 720 145 900', unknown: true,
    preview: 'Kurier dostarczy paczkę dziś 12-16.', body: 'Kurier dostarczy paczkę dziś między 12:00 a 16:00. Numer: PX99213.', mms: false },
];
const SIM_CALLERS = [
  { name: 'Zofia Wiśniewska', phone: '+48 603 456 789' },
  { name: '+48 511 882 030', phone: '+48 511 882 030', unknown: true },
  { name: 'Jan Kowalski', phone: '+48 601 234 567' },
  { name: '+48 790 600 411', phone: '+48 790 600 411', unknown: true },
];
let nextMsgIdx = 0, nextCallIdx = 0;

// Aktualny czas symulowany jako etykieta "16 cze, HH:MM".
function simStamp() {
  const d = new Date();
  return '16 cze, ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}

// Dopisuje połączenie na GÓRĘ listy "Połączenia" (i odświeża widok/oznaczenia).
// dir: 'in' (odebrane) | 'out' (wykonane) | 'missed' (nieodebrane).
const CALL_LABELS = { in: 'Odebrane', out: 'Wykonane', missed: 'Nieodebrane' };
function logCall(opt) {
  const dir = opt.dir;
  const c = {
    name: opt.name,
    phone: opt.phone || phoneOfName(opt.name) || '',
    dir,
    label: CALL_LABELS[dir] || 'Połączenie',
    time: simStamp(),
    dur: dir === 'missed' ? null : (opt.dur || 0),
    handled: dir !== 'missed',                 // nieodebrane wymaga obejrzenia
    unknown: opt.unknown != null ? !!opt.unknown : !contacts.some((x) => x.name === opt.name),
  };
  calls.unshift(c);
  updateBadges(); renderCalls();
  return c;
}

attachLongPress(document.getElementById('messages-tile'), () => {
  const t = SIM_SENDERS[nextMsgIdx % SIM_SENDERS.length]; nextMsgIdx++;
  // NOWY wpis na górze skrzynki.
  const m = Object.assign({}, t, { time: simStamp(), unread: true });
  messages.unshift(m);
  updateBadges(); renderInbox();
  pushMsgNotif(m);
});
attachLongPress(document.getElementById('calls-tile'), () => {
  const t = SIM_CALLERS[nextCallIdx % SIM_CALLERS.length]; nextCallIdx++;
  // NOWE nieodebrane połączenie na górze listy.
  const c = { name: t.name, phone: t.phone, dir: 'missed', label: 'Nieodebrane',
              time: simStamp(), dur: null, handled: false, unknown: !!t.unknown };
  calls.unshift(c);
  updateBadges(); renderCalls();
  pushCallNotif(c);
});
// Long-press kafla Kontakty = symulacja przychodzącej WIDEOROZMOWY.
attachLongPress(document.querySelector('.tile-contacts'), () => simulateIncoming(true));

// ---------------- POŁĄCZENIE PRZYCHODZĄCE (long-press Zadzwoń) ----------------
const incomingName = document.getElementById('incoming-name');
const incomingPhone = document.getElementById('incoming-phone');
const incomingAvatar = document.getElementById('incoming-avatar');
let incomingFrom = null, incomingIdx = 0;

const incomingLabel = document.getElementById('incoming-label');
const answerLabel = document.getElementById('answer-label');
const answerAudioBtn = document.getElementById('answer-audio-btn');
const ansIcoAudio = document.querySelector('.ans-ico-audio');
const ansIcoVideo = document.querySelector('.ans-ico-video');
let incomingIsVideo = false;
function answerIncoming() {
  stopRingtone();
  // Odbieramy bez fazy nawiązywania. Wideo gdy to była wideorozmowa.
  if (incomingFrom) startCall(incomingFrom.name, { incoming: true, video: incomingIsVideo });
}
function answerIncomingAudio() {
  // Odbierz wideorozmowę TYLKO głosowo.
  stopRingtone();
  if (incomingFrom) startCall(incomingFrom.name, { incoming: true, video: false });
}
function declineIncoming() {
  stopRingtone(); buzz(40);
  // Odrzucone przychodzące = nieodebrane w historii.
  if (incomingFrom) logCall({ name: incomingFrom.name, phone: incomingFrom.phone, dir: 'missed', unknown: incomingFrom.unknown });
  showScreen('home');
}
function simulateIncoming(forceVideo) {
  // Zwykłe przychodzące (long-press Zadzwoń) = głos. Wideo TYLKO wymuszone (long-press Kontakty).
  const c = contacts[incomingIdx % contacts.length];
  incomingIsVideo = !!forceVideo;
  incomingIdx++;
  incomingFrom = c;
  incomingName.textContent = c.name;
  incomingPhone.textContent = formatPhone(c.phone);
  incomingLabel.textContent = incomingIsVideo ? 'Wideorozmowa przychodząca' : 'Połączenie przychodzące';
  incomingAvatar.className = 'incall-avatar ringing avatar ' + c.color;
  incomingAvatar.textContent = c.initials;
  // Przycisk Odbierz: ikona kamery + "Odbierz wideo" dla wideorozmowy; opcja audio.
  ansIcoAudio.style.display = incomingIsVideo ? 'none' : 'inline';
  ansIcoVideo.style.display = incomingIsVideo ? 'inline' : 'none';
  answerLabel.textContent = incomingIsVideo ? 'Odbierz wideo' : 'Odbierz';
  answerAudioBtn.hidden = !incomingIsVideo;
  screenBeforeCall = 'home';
  showScreen('incoming');
  buzz([60, 120, 60, 120, 60]);
  startRingtone();   // dzwonek
}

// Odbierz/Odrzuć wymagają GESTU (przeciągnięcia przycisku w górę).
function attachSwipe(btn, onComplete) {
  let startY = null, dy = 0;
  const THRESH = 70;
  const begin = (y) => { startY = y; dy = 0; btn.classList.add('dragging'); };
  const move = (y) => {
    if (startY === null) return;
    dy = Math.max(0, startY - y);              // ile przeciągnięto w górę
    btn.style.transform = 'translateY(' + (-Math.min(dy, 120)) + 'px)';
    btn.style.opacity = String(1 - Math.min(dy, 120) / 220);
  };
  const end = () => {
    if (startY === null) return;
    const done = dy >= THRESH;
    btn.classList.remove('dragging');
    btn.style.transform = ''; btn.style.opacity = '';
    startY = null;
    if (done) onComplete();
  };
  btn.addEventListener('touchstart', (e) => begin(e.touches[0].clientY), { passive: true });
  btn.addEventListener('touchmove', (e) => move(e.touches[0].clientY), { passive: true });
  btn.addEventListener('touchend', end);
  // Mysz (do testów na PC/CDP)
  btn.addEventListener('mousedown', (e) => begin(e.clientY));
  window.addEventListener('mousemove', (e) => { if (startY !== null) move(e.clientY); });
  window.addEventListener('mouseup', end);
}
attachSwipe(document.querySelector('[data-role="answer"]'), answerIncoming);
attachSwipe(document.querySelector('[data-role="decline"]'), declineIncoming);
// "Odbierz tylko głosowo" — także przeciąganie w górę (gest).
attachSwipe(answerAudioBtn, answerIncomingAudio);

// ---------------- STREFY PASKA STATUSU (long-press) ----------------
// Zasięg (lewa) = tryb ciemny. Bateria (prawa) = kropka powiadomień (toggle).
attachLongPress(document.querySelector('.ind-signal'), () => {
  if (gateArmed) { openSettingsGate(); return; }   // 2. krok sekretnej sekwencji
  toggleDark();
});
attachLongPress(document.querySelector('.ind-batt'), () => {
  generalNotifications = generalNotifications > 0 ? 0 : 1;
  updateBadges(); buzz([20, 40, 20]);
  armGate();   // 1. krok sekretnej sekwencji (przytrzymanie baterii)
});

// ---------------- SEKRETNE WROTA DO USTAWIEŃ/NATYWNEGO EKRANU ----------------
// Sekwencja: przytrzymaj baterię (bzyk), POTEM w ciągu 4 s przytrzymaj zasięg (bzyk).
let gateArmed = false, gateTimer = null;
function armGate() {
  gateArmed = true;
  if (gateTimer) clearTimeout(gateTimer);
  gateTimer = setTimeout(() => { gateArmed = false; }, 4000);
}
function openSettingsGate() {
  gateArmed = false; if (gateTimer) clearTimeout(gateTimer);
  buzz([30, 60, 30]);
  // NIE przekierowujemy (about:blank niszczyłoby aplikację). Tylko komunikat —
  // w pełnej aplikacji systemowej nastąpiłoby tu wyjście do natywnego launchera/ustawień.
  alert('Wrota otwarte. W pełnej aplikacji systemowej nastąpiłoby teraz przejście do natywnego ekranu telefonu / ustawień.');
}

// ---------------- CIENKI WŁASNY SUWAK (overlay, nie zajmuje miejsca) ----------------
// Dla każdej przewijanej listy: kciuk .scroll-thumb pozycjonowany absolutnie,
// którego rozmiar/pozycję liczymy z scrollTop/scrollHeight/clientHeight. Widoczny
// (klasa .has-scroll) tylko gdy treść się nie mieści. Min. wysokość kciuka 40px.
const SCROLL_LIST_IDS = ['contacts-list', 'inbox-list', 'calls-list', 'contact-history-list'];
function updateScrollbar(list) {
  const thumb = list._thumb;
  if (!thumb) return;
  const { scrollHeight, clientHeight, scrollTop } = list;
  if (scrollHeight <= clientHeight + 1) { list.classList.remove('has-scroll'); return; }
  list.classList.add('has-scroll');
  const track = clientHeight;
  const h = Math.max(40, Math.round(track * clientHeight / scrollHeight));
  const maxTop = track - h;
  const top = Math.round((scrollTop / (scrollHeight - clientHeight)) * maxTop);
  thumb.style.height = h + 'px';
  // +scrollTop, by kciuk „płynął" z widocznym obszarem (jest dzieckiem scroll-kontenera).
  thumb.style.transform = 'translateY(' + (scrollTop + top) + 'px)';
}
// Dołącza kciuk jeśli go brak (render list robi innerHTML='' i go usuwa) i przelicza.
// Rozmiar/pozycję liczymy po następnej klatce, bo świeżo wstawione karty muszą się
// najpierw rozłożyć (scrollHeight musi być policzony).
function refreshScrollbar(list) {
  if (!list) return;
  list.classList.add('scroll-host');
  if (!list._thumb || !list.contains(list._thumb)) {
    const thumb = document.createElement('div');
    thumb.className = 'scroll-thumb';
    list.appendChild(thumb);
    list._thumb = thumb;
    if (!list._scrollBound) {
      list.addEventListener('scroll', () => updateScrollbar(list), { passive: true });
      list._scrollBound = true;
    }
  }
  requestAnimationFrame(() => updateScrollbar(list));
}
function updateAllScrollbars() {
  SCROLL_LIST_IDS.forEach((id) => refreshScrollbar(document.getElementById(id)));
}
function setupScrollbars() { updateAllScrollbars(); }
// Wywoływane z renderów list, by kciuk odtworzyć po przebudowie zawartości.
function refreshScrollbarById(id) { refreshScrollbar(document.getElementById(id)); }
// Po zmianie rozmiaru okna geometria list się zmienia — przelicz kciuki.
window.addEventListener('resize', updateAllScrollbars);

// ---------------- INICJALIZACJA ----------------
// Wycisz/Odcisz TYLKO przez przytrzymanie (nie zwykły klik — by nie wyciszać przypadkiem).
attachLongPress(muteTile, clickMute);
renderContacts();
renderInbox();
renderCalls();
updateBadges();
setupScrollbars();

// Na starcie wrzuć istniejące nieodebrane/nieprzeczytane jako popupy do odhaczenia,
// żeby od razu było widać panel powiadomień (najnowszy na wierzchu).
calls.filter((c) => c.dir === 'missed' && !c.handled).forEach((c) => notifQueue.push({ type: 'call', ref: c }));
messages.filter((m) => m.unread).forEach((m) => notifQueue.push({ type: 'msg', ref: m }));
renderTopNotif();

// ---------------- SERVICE WORKER ----------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
