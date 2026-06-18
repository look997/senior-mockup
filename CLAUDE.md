# CLAUDE.md — Telefon Seniora (mockup launchera, PWA)

## Co to jest
Makieta launchera telefonu dla osoby starszej, działająca jako PWA na pełny ekran.
Czysty **vanilla HTML/CSS/JS**, zero frameworków i zależności. Sztywna ramka
**720×1604**, wyśrodkowana, skalowana przez JS (`fitFrame()` → `--scale`).
Pełny opis funkcji i widoków: `README.md`.

## Zasada naczelna: ZERO GESTÓW, dla seniora
Obsługa wyłącznie dotknięciem dużych przycisków. „Dotknij → akcja" ma działać jak
fizyczny guzik. **Reakcja wizualna na wciśnięcie jest CZĘŚCIĄ działania, nie
kosmetyką** — bez niej użytkownik nie wie, czy przycisk zadziałał (krytyczne zwłaszcza
w widokach z przewijaniem, ale nie tylko). Nigdy nie traktować braku/utraty
podświetlenia jako „tylko wizualne".

Jedyne dozwolone gesty: **przewijanie list**, **przeciągnięcie‑odbierz** (połączenie
przychodzące), **przeciągnięcie‑odblokuj** (ekran blokady). Nic więcej.

## Model interakcji (NIE ruszać bez wyraźnego powodu — kosztował dużo bólu)
- **Tap = `pointerdown` + `pointerup` na TYM SAMYM przycisku.** Droga palca pomiędzy
  jest nieistotna; puszczenie poza przyciskiem = anulowanie. **ŻADNEJ strefy
  tolerancji** — granicą jest sam przycisk. Implementacja: `setupTap()` w `app.js`.
- **Nie polegać na `click`** do aktywacji — przeglądarka kasuje go przy ruchu palca.
  Nie wracać do gołego `click` ani do tolerancji promieniowej (oba świadomie odrzucone).
- **Podświetlenie wciśnięcia = klasa `.is-pressed`** sterowana pointerami, **nie
  `:active`** (przeglądarka zrzuca `:active` przy ruchu → przycisk „puszcza" wizualnie
  mimo że akcja idzie). W CSS każdy stan wciśnięcia to `:is(:active, .is-pressed)`.
  `.is-pressed` trzyma się, póki palec jest NA przycisku; znika po zejściu, wraca po powrocie.
- **`button { touch-action: none }`** — żeby ruch na przycisku nie był przejęty jako
  scroll (brak `pointercancel`, tap dochodzi). **Listy** (`.contacts-list` itd.) też mają
  `touch-action: none`, a przewijanie obsługuje RĘCZNIE `setupTap` w JS: ruch w PIONIE
  ponad próg (`VERT_TOL`) przewija listę 1:1 z palcem — działa też po ruchu w bok (natywny
  `pan-y` blokował kierunek na starcie); ruch w bok zostawia tap; próg pionu nieco większy
  (tolerancja dla drżącego palca). Bez momentum/flingu (scroll 1:1). Karty list SAME są `<button>`.
- **Long‑press = `attachLongPress()`**: tylko na elementach nieprzewijalnych; odpala,
  póki palec jest na przycisku, anuluje się po zejściu z niego (granice w `pointermove`).
- Zoom i „ucieczki" zablokowane: viewport `user-scalable=no, maximum-scale=1`;
  `contextmenu`+`dragstart` blokowane w JS; `-webkit-touch-callout:none`,
  `overscroll-behavior:none` w CSS.

## Testowanie na telefonie (Samsung S24 FE, ADB po WiFi)
- `adb connect 192.168.1.243:5555` (model SM_S721B). **Jak ADB nie łapie → ekran
  zgaszony/zablokowany;** poprosić użytkownika o odblokowanie i ponowić.
- Wdrożenie: `DEVICE=192.168.1.243:5555 ./deploy.sh` (uruchamia `serve.js` + `adb reverse
  tcp:8080`). SW jest network‑first → reload zaciąga świeże pliki.
- **`adb shell input` NIE dochodzi do treści WebView.** Do sterowania stroną używać
  **Chrome DevTools Protocol**: `adb forward tcp:9222 localabstract:chrome_devtools_remote`,
  potem `Input.dispatchTouchEvent` / `Runtime.evaluate` po WebSocket (klient w `/tmp/cdp.py`).
- **WAŻNE: syntetyczny dotyk CDP NIE odwzorowuje wiernie prawdziwego palca**
  (gesty / scroll / `:active`). „Zielony" test CDP potrafi ukryć realny bug —
  **ostateczna weryfikacja to palec użytkownika na telefonie.**
- dpr S24 FE ≈ 2.81 (1 CSS px ≈ 2.81 px fizycznego).

## Zasady pracy (specyficzne dla projektu — reszta w globalnym `~/.claude/CLAUDE.md`)
- **NIE ruszać `todo.txt`.**
- **`README.md` tylko na wyraźne polecenie.**
- **Commit / push / publikacja tylko na wyraźne polecenie.**

## Struktura plików
`index.html` (ekrany + inline SVG) · `styles.css` (styl, ramka, tryb ciemny) ·
`app.js` (cała logika: skalowanie, nawigacja, dialery, połączenia, powiadomienia,
interakcja dotykowa) · `manifest.json` · `sw.js` (network‑first) · `gen-icons.js` ·
`serve.js` (statyczny, no‑cache) · `deploy.sh` (adb reverse + Chrome na telefonie).
