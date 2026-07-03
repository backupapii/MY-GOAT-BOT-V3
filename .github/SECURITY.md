# Security Policy — SHAKIL BOT V3

## 🔒 Supported Versions

| Version | Supported |
|---------|-----------|
| 3.x (current) | ✅ |
| < 3.0 | ❌ |

---

## 🚨 Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

If you find a security issue, please report it privately:

1. **Facebook:** https://www.facebook.com/61588178231072
2. **Email:** Contact via Facebook Messenger

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within **48 hours** and patch critical issues within **7 days**.

---

## 🛡️ Security Measures in Place

### Repository
- `account.txt` (Facebook session cookies) must **never** be committed to a public repo
- Bot owner UID and admin IDs should be set via **env vars** (`OWNER_UID`, `ADMIN_BOT`), not hardcoded
- All API keys should be set via env vars (see ENV VARS section below)
- `.gitignore` blocks: `.env`, `appstate.json`, `cookies.json`, `*.pem`, `*.key`, `logs/`

### Dashboard
- Session cookies: `httpOnly`, `sameSite: lax`, secure in production
- Session secret: stable per-deployment (env var `SESSION_SECRET` or auto-generated on first run)
- Security headers on all responses: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`
- Rate limiting on all routes via `express-rate-limit`
- Passport.js authentication with bcrypt password hashing

### Bot Commands
- `eval.js`, `cmd.js`, `Shell.js`, `Shell3.js` — all require **role 2-3** (bot admin / owner only)
- Owner check uses `global.GoatBot.config.ownerUID` — configurable via env var
- No public eval / shell access

---

## 🔑 Required Environment Variables

Set these in Replit Secrets / Railway / Render environment panel:

| Variable | Required | Description |
|----------|----------|-------------|
| `APPSTATE` | **CRITICAL** | Facebook session JSON (content of account.txt) |
| `OWNER_UID` | Recommended | Bot owner Facebook UID |
| `ADMIN_BOT` | Recommended | Comma-separated admin Facebook UIDs |
| `SESSION_SECRET` | Recommended | Stable string for dashboard session encryption |
| `OWNER_THREAD` | Optional | Owner group thread ID |
| `BETABOTZ_API_KEY` | Optional | BetaBotz API key |
| `KAIZ_API_KEY` | Optional | Kaiz API key |

---

## ⚠️ Known Security Considerations

1. **Facebook Session Cookie** (`account.txt`) — this is full account access. Treat it like a password.
   - Rotate by logging out the bot account on Facebook and re-generating the appstate
   - If you suspect compromise: immediately change your Facebook password and revoke all sessions

2. **Public Repository Warning** — if this repo is public, the `ownerUID` in `config.json` is visible. Use `OWNER_UID` env var instead and clear the value from `config.json`.

3. **Dashboard Access** — the dashboard at port 3002 is protected by login, but ensure your deployment platform does not expose internal ports publicly without auth.
