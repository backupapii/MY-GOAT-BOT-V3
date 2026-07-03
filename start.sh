#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SHAKIL BOT V3 — Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Restore account.txt from env var ─────────────────────────────────────────
if [ ! -f "account.txt" ] || [ ! -s "account.txt" ]; then
    if [ -n "$APPSTATE" ]; then
        echo "[*] Restoring account.txt from APPSTATE environment variable..."
        printf '%s' "$APPSTATE" > account.txt
    else
        echo "[!] WARNING: account.txt missing and APPSTATE env var not set."
        echo "[!] Bot will fail to login. Set APPSTATE in Replit Secrets."
    fi
else
    echo "[*] account.txt found."
fi

# ── Ensure required directories exist ────────────────────────────────────────
mkdir -p scripts/cmds/cache scripts/cmds/tmp scripts/cmds/fonts \
         scripts/events/tmp scripts/events/data/leaveAttachment \
         scripts/events/data/welcomeAttachment \
         database/data cache logs

# ── Ensure .gitkeep files exist ───────────────────────────────────────────────
touch database/data/.gitkeep
touch scripts/cmds/tmp/.gitkeep
touch scripts/events/tmp/.gitkeep

# ── Remove stale instance lock (clean start) ─────────────────────────────────
if [ -f ".instance.lock" ]; then
    echo "[*] Removing stale instance lock..."
    rm -f .instance.lock
fi

# ── Install/verify dependencies ──────────────────────────────────────────────
if [ ! -d "node_modules/express" ]; then
    echo "[*] Installing dependencies..."
    npm install --legacy-peer-deps
else
    echo "[*] Dependencies already installed, skipping..."
fi

echo "[*] Applying FCA patches..."
node scripts/patch-fca.js || true

echo "[*] Starting SHAKIL BOT V3..."
exec node index.js
