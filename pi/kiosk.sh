#!/bin/bash
# Kiosk cucina Scivedda: apre la dashboard a schermo intero e, se Chromium
# si chiude o si pianta, lo riapre da solo dopo 3 secondi.
# La dashboard è servita dal servizio locale (index.js) su localhost:3999.

URL="http://localhost:3999/"

while true; do
  chromium --kiosk --noerrdialogs --disable-infobars --no-first-run \
    --password-store=basic --disable-session-crashed-bubble "$URL"
  sleep 3
done
