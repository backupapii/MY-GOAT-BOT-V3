/**
 * AUTO RELOGIN + MQTT WATCHDOG v3.1
 * ─────────────────────────────────────────────────────────────
 * ROOT CAUSE FIX: Replit's network proxy kills idle WebSocket
 * (MQTT) connections after ~10-15 min of inactivity.
 *
 * Strategy:
 *   1. Heartbeat every 3 min → keeps FB HTTP session warm
 *   2. On 1st failure → attempt refreshFbState
 *   3. On 2nd failure → attempt MQTT restart via reLoginBot
 *   4. Alert admin on disconnect and recovery
 *   5. CHECKPOINT detection → pause all retries for 60 min
 *      (spamming FB during a checkpoint makes it harder to unblock)
 * ─────────────────────────────────────────────────────────────
 * Author: CYBER-SHAKIL
 */

const HEARTBEAT_MS      = 3 * 60 * 1000;   // ping FB every 3 minutes
const ALERT_COOLDOWN    = 30 * 60 * 1000;  // max 1 alert per 30 min
const RELOGIN_COOLDOWN  = 5 * 60 * 1000;   // min 5 min between re-logins
const CHECKPOINT_PAUSE  = 60 * 60 * 1000;  // 60 min pause when checkpoint detected

let _api               = null;
let _botID             = null;
let _lastAlertTime     = 0;
let _lastReloginTime   = 0;
let _failCount         = 0;
let _connected         = true;
let _heartbeatTimer    = null;
let _checkpointUntil   = 0;  // timestamp: don't retry until this time

// ─── get admin UIDs from config (no hardcoded UIDs) ──────────
function getAdminUIDs() {
  try {
    const config = global.GoatBot?.config || {};
    const ownerEnv = process.env.OWNER_UID;
    const adminEnv = process.env.ADMIN_BOT;
    const fromEnv = [
      ...(ownerEnv ? [ownerEnv.trim()] : []),
      ...(adminEnv ? adminEnv.split(",").map(s => s.trim()).filter(Boolean) : [])
    ];
    if (fromEnv.length) return fromEnv;
    const fromConfig = [
      ...(config.ownerUID ? [String(config.ownerUID)] : []),
      ...(Array.isArray(config.adminBot) ? config.adminBot.map(String) : [])
    ].filter(Boolean);
    return fromConfig.length ? fromConfig : [];
  } catch { return []; }
}

// ─── notify admin ────────────────────────────────────────────
function notifyAdmin(msg) {
  if (!_api) return;
  const now = Date.now();
  if (now - _lastAlertTime < ALERT_COOLDOWN) return;
  _lastAlertTime = now;
  for (const uid of getAdminUIDs()) {
    _api.sendMessage(`🤖 BOT ALERT:\n${msg}`, uid).catch(() => {});
  }
}

// ─── checkpoint detected → pause all retries ─────────────────
function handleCheckpoint() {
  if (_checkpointUntil > Date.now()) return; // already paused
  _checkpointUntil = Date.now() + CHECKPOINT_PAUSE;
  console.warn(
    `[autoRelogin] 🚨 CHECKPOINT DETECTED — pausing retries for 60 min.\n` +
    `  Action required: Log into the bot's Facebook account in a browser,\n` +
    `  complete the security check, then get a fresh appstate.\n` +
    `  Retries will resume at: ${new Date(_checkpointUntil).toLocaleTimeString()}`
  );
}

// ─── lightweight ping to FB (keeps session alive) ────────────
async function pingFB() {
  if (!_api || !_botID) return true;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), 12000);
    _api.getUserInfo(_botID, (err) => {
      clearTimeout(timer);
      if (err) {
        const msg = String(err?.error || err?.message || err || "");
        if (msg.includes("checkpoint") || msg.includes("login_blocked") || msg.includes("account_inactive")) {
          handleCheckpoint();
        }
      }
      resolve(!err);
    });
  });
}

// ─── attempt MQTT / session recovery ─────────────────────────
async function attemptRecovery() {
  // Don't retry if checkpoint is active
  if (Date.now() < _checkpointUntil) {
    const mins = Math.ceil((_checkpointUntil - Date.now()) / 60000);
    console.log(`[autoRelogin] 🔒 Checkpoint pause — ${mins} min remaining. Skipping recovery.`);
    return;
  }

  const now = Date.now();
  if (now - _lastReloginTime < RELOGIN_COOLDOWN) {
    console.log("[autoRelogin] ⏳ Recovery cooldown — skipping");
    return;
  }
  _lastReloginTime = now;

  console.log("[autoRelogin] 🔄 Attempting recovery...");

  // Strategy 1: refresh fbstate (lightweight)
  try {
    if (typeof _api.refreshFbState === "function") {
      await _api.refreshFbState();
      console.log("[autoRelogin] ✅ FbState refreshed successfully");
      return;
    }
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("checkpoint") || msg.includes("login_blocked")) {
      handleCheckpoint();
      return;
    }
    console.warn("[autoRelogin] ⚠️ FbState refresh failed:", msg.slice(0, 80));
  }

  // Strategy 2: full re-login (restarts MQTT + session)
  try {
    if (typeof global.GoatBot?.reLoginBot === "function") {
      console.log("[autoRelogin] 🔁 Triggering full reLoginBot...");
      global.GoatBot.reLoginBot();
      return;
    }
  } catch (e) {
    console.warn("[autoRelogin] ⚠️ reLoginBot failed:", String(e?.message || "").slice(0, 80));
  }

  console.error("[autoRelogin] ❌ All recovery strategies failed");
}

// ─── main heartbeat loop ──────────────────────────────────────
function startHeartbeat() {
  if (_heartbeatTimer) return;

  _heartbeatTimer = setInterval(async () => {
    if (!_api) return;

    // Skip ping entirely during checkpoint pause
    if (Date.now() < _checkpointUntil) return;

    const ok = await pingFB();

    if (ok) {
      if (!_connected) {
        _connected = true;
        _failCount  = 0;
        console.log("[autoRelogin] ✅ Connection restored");
        notifyAdmin("✅ Bot is back online!\nMQTT reconnected successfully.");
      }
      return;
    }

    // Skip retries during checkpoint pause (may have been set by pingFB)
    if (Date.now() < _checkpointUntil) return;

    // Ping failed
    _failCount++;
    _connected = false;
    console.warn(`[autoRelogin] ⚠️ Ping failed (attempt ${_failCount})`);

    if (_failCount === 1) {
      notifyAdmin(
        `⚠️ Connection issue detected!\n` +
        `Attempt: ${_failCount}\nTrying auto-recovery...`
      );
    }

    await attemptRecovery();

  }, HEARTBEAT_MS);

  // Don't block process exit
  _heartbeatTimer.unref();
}

// ─── error suppression (MQTT network noise + checkpoint) ─────
const _suppressedErrors = [
  "read ECONNRESET", "socket hang up", "EPIPE",
  "ENOTFOUND", "ETIMEDOUT", "ECONNREFUSED", "write ECONNRESET"
];

process.on("uncaughtException", (err) => {
  const msg = String(err?.message || err);
  if (_suppressedErrors.some(e => msg.includes(e))) {
    console.warn("[autoRelogin] ⚠️ Suppressed network error:", msg.slice(0, 80));
    return;
  }
  if (msg.includes("checkpoint") || msg.includes("login_blocked")) {
    handleCheckpoint();
    return;
  }
  console.error("[autoRelogin] 💥 Uncaught exception:", msg.slice(0, 200));
});

process.on("unhandledRejection", (reason) => {
  const msg = String(reason?.message || reason || "");
  if (_suppressedErrors.some(e => msg.includes(e))) return;
  if (msg.includes("checkpoint") || msg.includes("login_blocked")) {
    handleCheckpoint();
    return;
  }
  if (msg.length > 0)
    console.warn("[autoRelogin] ⚠️ Unhandled rejection:", msg.slice(0, 200));
});

// ─── module export ────────────────────────────────────────────
module.exports = {
  config: {
    name: "autoRelogin",
    version: "3.1",
    author: "CYBER-SHAKIL",
    description: "MQTT watchdog — 3-min heartbeat, auto-reconnect, FB session keepalive, checkpoint detection",
    category: "events"
  },

  onStart: async function ({ api }) {
    _api       = api;
    _botID     = api.getCurrentUserID();
    _connected = true;
    _failCount  = 0;

    startHeartbeat();

    console.log(
      `[autoRelogin] ✅ Watchdog v3.1 started\n` +
      `  ⏱ Heartbeat: every ${HEARTBEAT_MS / 60000} min\n` +
      `  🔁 Recovery cooldown: ${RELOGIN_COOLDOWN / 60000} min\n` +
      `  🚨 Checkpoint pause: ${CHECKPOINT_PAUSE / 60000} min`
    );
  }
};
