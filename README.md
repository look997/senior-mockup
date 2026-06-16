# Telefon Seniora — mockup launchera (PWA)

Mockup prostego launchera dla seniora, zbierający inspiracje (BIG Launcher, Doro,
Jitterbug, Samsung Easy Mode, Key/T9 Launcher) w jeden spójny, „wysepkowy" projekt.
Styl: jasna baza, wysoki kontrast, taktylne „fizyczne klawisze", kolorowe akcenty
funkcyjne (zielony = zadzwoń, czerwony = nieodebrane/usuń, niebieski = wiadomości).

## Wymiary i ramka

- Bazowy ekran **720×1604 px** (6,67", proporcje Motorola Moto E15).
- Ramka jest **wyśrodkowana** na czarnym tle ekranu hosta, z zaokrąglonymi rogami
  i **symulowanym oczkiem aparatu** (punch-hole) na górze.
- Skalowanie ramki liczy JS (`fitFrame()` → `--scale`), bo CSS `scale()` wymaga
  liczby bezwymiarowej. Działa na dowolnym ekranie (testowane na Galaxy S24 FE
  1080×2340).

## Ekrany (bez obsługi gestami — tylko tapnięcia)

1. **HOME** — kafle aplikacji (Kontakty, Wiadomości) + pełny dialer T9 naraz.
2. **Kontakty** — lista kontaktów-wysp + pełny dialer pod spodem.
3. **Wiadomości** — skrzynka odbiorcza + ostatnie połączenia (bez dialera),
   na dole prostokątny przycisk **„Klawiatura"** wracający do HOME.

Górny pasek statusu na każdym ekranie: godzina, data + dzień tygodnia (pl-PL),
graficzny zasięg i bateria (czyta realny stan przez `navigator.getBattery`,
fallback 80%).

## Uruchomienie i dostarczenie na telefon

Wymagane: Node 20+, `adb`, telefon podłączony (USB lub WiFi `adb connect IP:5555`).

```bash
# 1. Uruchom serwer (port 8080)
node serve.js

# 2. W drugim terminalu: tunel + otwórz Chrome na telefonie
./deploy.sh
# (dla konkretnego urządzenia: DEVICE=192.168.1.42:5555 ./deploy.sh)
```

`deploy.sh` robi `adb reverse tcp:8080 tcp:8080` i otwiera
`http://localhost:8080` w Chrome na telefonie. `localhost` jest traktowany jako
bezpieczny kontekst, więc PWA i service worker działają bez HTTPS.

### Instalacja jako PWA fullscreen

Na telefonie w Chrome: **menu (⋮) → „Dodaj do ekranu głównego"**. Uruchomiona
z ikony aplikacja startuje w trybie `fullscreen` (bez paska adresu i bez
systemowego paska statusu — rysujemy własny), więc ramka 720×1604 jest
wyśrodkowana z czarnym letterboxem.

## Debugowanie

- `chrome://inspect` na PC (po `adb forward tcp:9222 localabstract:chrome_devtools_remote`).
- Service worker jest **network-first** — zmiany w plikach widać po odświeżeniu;
  jeśli nie, w DevTools zaznacz „Update on reload" lub wyrejestruj SW.

## Pliki

| Plik | Rola |
|------|------|
| `index.html` | struktura 3 ekranów + inline SVG ikony |
| `styles.css` | wysepkowy taktylny styl, ramka, pasek statusu |
| `app.js` | skalowanie ramki, zegar/data/bateria, nawigacja, dialery, render danych |
| `manifest.json` | PWA (display: fullscreen, ikony) |
| `sw.js` | service worker (network-first + offline fallback) |
| `gen-icons.js` | generuje ikony PNG bez zależności (zielona słuchawka) |
| `serve.js` | serwer statyczny (no-cache, Service-Worker-Allowed) |
| `deploy.sh` | adb reverse + otwarcie Chrome na telefonie |

Regeneracja ikon: `node gen-icons.js`.
