---
name: SHAKIL BOT V3 command fixes
description: Key fixes for broken/missing commands, alias conflicts, API updates, and Dockerfile improvements
---

## Up.js was truncated
- File ended at line 562 mid-forEach — missing closing `});`, end of `if (page === "overview")`, return, and entire module.exports
- Fix: append closing brackets + full `onStart` that calls getCPU/getDisk/etc helper functions already defined in file (lines 125-197)
- `getDhakaTime`, `getCPU`, `getDisk`, `getDiskTotal`, `getDiskUsed`, `getNetwork`, `getNetworkIPs`, `getTemperature` are ALL defined in Up.js before line 200

## Alias conflicts
- `Up.js` must NOT use aliases: "uptime", "ping", "status" — those belong to `Up2.js` (uptime) and `alive.js` (ping, status, r)
- Safe aliases for Up.js: `["sysinfo", "sysmon"]`
- **Why:** Bot refuses to load if two commands register the same alias

## Missing commands (created fresh)
- `prefix.js` — show/set/reset prefix; role 0 so any user can view, only adminBot can change
- `uid.js` — get UID from mention, reply, self, or FB profile URL (uses graph API token)
- `uff.js` — fun frustration command in Bengali; supports mention/reply/self

## Gemini API
- Model name: `gemini-2.0-flash` (not `gemini-flash-latest`)
- API URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Auth via header `X-goog-api-key` — do NOT append `?key=` to the URL
- Key read from `process.env.GEMINI_API_KEY`

## video.js multi-API fallback
- Primary pipedapi.kavin.rocks is unreliable; replaced with 3 free download APIs + pipedapi fallback
- yt-search package is installed and working for title/videoId lookup

## Dockerfile (Railway/Render)
- Added pnpm install: `npm install -g pnpm@10` then `pnpm install --frozen-lockfile || npm install --legacy-peer-deps`
- Copy `pnpm-lock.yaml*` alongside `package*.json`
- Added `curl`, `fonts-noto-color-emoji` to apt deps
- Added HEALTHCHECK using curl

## Duplicate command warnings on boot
- "Duplicate command X found in X.js — overriding previous version" is NORMAL if a command appears in multiple files
- The LAST loaded file wins; alphabetical file load order applies
