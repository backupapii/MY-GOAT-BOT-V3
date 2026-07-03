---
name: SHAKIL BOT V3 command count and state
description: Current state of the bot after Testing-bot sync session (June 2026).
---

# Current Bot State (June 2026)

## Counts (clean run, 0 errors)
- **Commands loaded**: 379 (no alias errors, no duplicates)
- **Events**: 15
- **Total .js files in scripts/cmds**: ~380

## Commands Fixed/Updated from Testing-bot Analysis
- `allbox.js` → Replaced with better version: name "allbox", aliases ["allgc","allgroup"], ban/unban/del/out actions
- `balance.js` → name fixed from "balancec" → "balance" (my version kept, better card design)
- `sexvid.js` → name fixed from "sex" → "sexvid" (alias conflict resolved)
- `anisearch.js` → Fixed broken API (added TikTok fallback via tikwm.com)
- `help.js` → Replaced with category-grouped version (multilingual EN/BN, 90s auto-delete)
- `ping.js` → Replaced with response-time + uptime + memory version

## Stability: Why My Bot > Testing-bot
- **MQTT restart**: 600000ms (10 min) vs TB's 900000ms → Better for Replit proxy (drops at ~10-15 min)
- **Self-ping**: Now pings own health URL every 4 min on Replit, 14 min on Render/Railway (TB has no Replit self-ping)
- **Health server**: Always binds to 0.0.0.0:3000 (TB only runs if PORT env is set)
- **Session backup**: Goat.js restores account.txt from APPSTATE env (TB doesn't)
- **Single instance guard**: Prevents duplicate zombie processes (TB has this too)
- **OWNER_UID env override**: Config values overridable from env without editing files (TB doesn't)

## Duplicate Command Renames (15 total, from earlier session)
When adding commands from external repos, these names were already taken and had to be renamed:
- Anipub.js → "anipub", Baby.js → "baby", Cdp.js → "cdp2", Dim.js → "dim2", Dog.js → "dog2"
- Fbinfo.js → "fbinfo2", Meme.js → "meme2", Propose.js → "propose2", Spy.js → "spy2"
- Tag.js → "tag2", Uff.js → "uff2", War.js → "war2", Up.js → "sysinfo"
- `Auto sticker.js` → "asticker", fakechat.js → "fakechat2"

## Alias Conflicts to Avoid
- "qrcode", "qrgen" — taken by qrgen.js
- "uptime" — taken by Up2.js
- "status" — taken by alive.js
- "allgroup", "allgc" — now aliases of allbox.js (not separate commands)
- "bal", "wallet" — taken by balance.js
- "sex", "sexy" — aliases of sexvid.js

## Deployment Status
- **Replit**: Running ✅ — health server on 0.0.0.0:3000, dashboard on 3002
- **Railway**: Dockerfile builder, health check `/health` on PORT env var
- **Render**: Dockerfile builder, no hardcoded PORT (Render injects it)

## Known Non-Issues
- Google/Gmail/Drive warnings — credentials not configured, non-blocking
- "REFRESH COOKIE" warning — email/password not set, non-blocking
- Periodic FB checkpoint errors → bot auto-restarts and recovers
