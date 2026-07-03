---
name: SHAKIL BOT V3 stability fixes
description: Root cause and fix for bot going offline every 10-15 min + deploy safety + onChat crash
---

## Root Causes & Fixes

### 1. Bot offline every 10-15 min
- **Why**: Replit's network proxy drops idle WebSocket (MQTT) connections after ~10-15 min.
- **Fix**: `config.json` `restartListenMqtt.timeRestart` = 600000 (10min). Bot proactively cycles MQTT before the connection drops silently.
- **CRITICAL**: Do NOT increase this above 600000 on Replit — doing so allows the Replit proxy to silently drop the MQTT connection before the bot can restart it.
- **Fix**: `scripts/events/autoRelogin.js` heartbeat 3min. Pings FB via `api.getUserInfo(botID)`. On failure → tries `refreshFbState()` then `reLoginBot()`.
- **Fix**: `scripts/events/autoPerformance.js` clears stale onReply/onReaction/countDown caches every 10min.
- **Note**: FCA MQTT keepalive is already 60s (line 129 of listenMqtt.js). The 10min restart is the real fix.

### 2. Multiple-deploy Facebook suspension risk
- **Why**: `bot/singleInstance.js` had `SHUTDOWN_DELAY_MS = 60 * 1000`. Old instance kept running 60s after new one started.
- **Fix**: Reduced to `8 * 1000` (8s). `RENEW_MS` reduced from 15s → 5s for faster detection.

### 3. `command.onChat is not a function` crash
- **Fix**: Added `if (typeof command.onChat !== "function") continue;` in `bot/handler/handlerEvents.js`.

### 4. Facebook session expires (login error)
- Root cause of "Error retrieving userID" login error = expired/blocked cookie in account.txt.
- Fix: User must provide fresh appstate via APPSTATE secret or re-running login.
- account.txt format: JSON array of cookie objects (14 cookies). c_user cookie must be present.

## Key files
- `bot/singleInstance.js` — instance guard
- `scripts/events/autoRelogin.js` — heartbeat watchdog  
- `scripts/events/autoPerformance.js` — memory/cache manager
- `config.json` → `restartListenMqtt.timeRestart` must stay at 600000 on Replit
- `bot/handler/handlerEvents.js` — onChat guard
