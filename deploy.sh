#!/usr/bin/env bash
# Dostarcza mockup na telefon: tuneluje port przez ADB i otwiera Chrome.
# Serwer (serve.js) musi już działać LUB zostanie uruchomiony w tle tym skryptem.
set -euo pipefail

PORT="${PORT:-8080}"
URL="http://localhost:${PORT}"
# Domyślnie pierwszy podłączony device; nadpisz przez DEVICE=ip:port ./deploy.sh
DEVICE="${DEVICE:-}"

cd "$(dirname "$0")"

adb_dev() {
  if [ -n "$DEVICE" ]; then adb -s "$DEVICE" "$@"; else adb "$@"; fi
}

echo "==> Sprawdzam połączenie ADB..."
adb_dev get-state >/dev/null 2>&1 || { echo "BŁĄD: brak urządzenia ADB. Podłącz przez 'adb connect <ip>:5555'."; exit 1; }
adb_dev devices -l | sed -n '2p'

# Uruchom serwer, jeśli nie odpowiada.
if ! curl -sf "$URL" -o /dev/null 2>&1; then
  echo "==> Serwer nie odpowiada, uruchamiam serve.js w tle..."
  nohup node serve.js >/tmp/senior-launcher-serve.log 2>&1 &
  sleep 1
fi

echo "==> Tuneluję port ${PORT} (adb reverse)..."
adb_dev reverse --remove-all 2>/dev/null || true
adb_dev reverse "tcp:${PORT}" "tcp:${PORT}"

echo "==> Otwieram ${URL} w Chrome na telefonie..."
adb_dev shell am start -a android.intent.action.VIEW -d "$URL" com.android.chrome >/dev/null 2>&1 \
  || adb_dev shell am start -a android.intent.action.VIEW -d "$URL" >/dev/null 2>&1

echo "==> Gotowe. Na telefonie: menu Chrome → 'Dodaj do ekranu głównego' aby uruchamiać jako PWA fullscreen."
echo "    Debug: chrome://inspect na PC (urządzenie pojawi się po otwarciu strony)."
