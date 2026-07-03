/**
 * AUTO PERFORMANCE MANAGER v1.0
 * ─────────────────────────────────────────────────────────────
 * Prevents memory leaks and keeps the bot fast:
 *   - Clears stale onReply/onReaction entries every 10 min
 *   - Clears expired countDown entries every 15 min
 *   - Logs memory usage every 30 min
 *   - Prevents callbackListenTime map from growing unbounded
 * ─────────────────────────────────────────────────────────────
 * Author: CYBER-SHAKIL
 */

const REPLY_TTL      = 15 * 60 * 1000;   // 15 min — stale onReply entries
const CLEANUP_MS     = 10 * 60 * 1000;   // run cleanup every 10 min
const MEMORY_LOG_MS  = 30 * 60 * 1000;   // log memory every 30 min
const CALLBACK_TTL   = 30 * 60 * 1000;   // 30 min — old callbackListenTime

let _cleanupTimer   = null;
let _memoryTimer    = null;

function bytesToMB(b) { return (b / 1024 / 1024).toFixed(1); }

function runCleanup() {
  const now   = Date.now();
  const goat  = global.GoatBot;
  if (!goat) return;

  let cleared = 0;

  // 1. Stale onReply entries
  if (goat.onReply instanceof Map) {
    for (const [msgID, data] of goat.onReply) {
      const age = now - (data.time || data.timestamp || 0);
      if (age > REPLY_TTL) {
        goat.onReply.delete(msgID);
        cleared++;
      }
    }
  }

  // 2. Stale onReaction entries
  if (goat.onReaction instanceof Map) {
    for (const [msgID, data] of goat.onReaction) {
      const age = now - (data.time || data.timestamp || 0);
      if (age > REPLY_TTL) {
        goat.onReaction.delete(msgID);
        cleared++;
      }
    }
  }

  // 3. Bloated callbackListenTime map
  if (goat.callbackListenTime && typeof goat.callbackListenTime === "object") {
    const keys = Object.keys(goat.callbackListenTime);
    if (keys.length > 500) {
      // Keep only recent 200 entries
      const toDelete = keys.slice(0, keys.length - 200);
      for (const k of toDelete) delete goat.callbackListenTime[k];
      cleared += toDelete.length;
    }
  }

  // 4. Stale countDown entries (global.client.countDown)
  if (global.client?.countDown) {
    const cd = global.client.countDown;
    for (const key of Object.keys(cd)) {
      if (now - (cd[key] || 0) > CALLBACK_TTL) {
        delete cd[key];
        cleared++;
      }
    }
  }

  if (cleared > 0) {
    console.log(`[autoPerformance] 🧹 Cleared ${cleared} stale cache entries`);
  }
}

function logMemory() {
  const mem  = process.memoryUsage();
  const goat = global.GoatBot;
  const replySize    = goat?.onReply instanceof Map ? goat.onReply.size : 0;
  const reactionSize = goat?.onReaction instanceof Map ? goat.onReaction.size : 0;

  console.log(
    `[autoPerformance] 📊 Memory\n` +
    `  RSS: ${bytesToMB(mem.rss)} MB\n` +
    `  Heap: ${bytesToMB(mem.heapUsed)} / ${bytesToMB(mem.heapTotal)} MB\n` +
    `  onReply: ${replySize} | onReaction: ${reactionSize}`
  );
}

module.exports = {
  config: {
    name: "autoPerformance",
    version: "1.0",
    author: "CYBER-SHAKIL",
    description: "Memory & cache manager — keeps bot fast and prevents leaks",
    category: "events"
  },

  onStart: async function () {
    // Run once immediately on start
    setTimeout(runCleanup, 60 * 1000); // delay 1 min after start

    // Periodic cleanup
    _cleanupTimer = setInterval(runCleanup, CLEANUP_MS);
    _cleanupTimer.unref();

    // Memory logging
    _memoryTimer = setInterval(logMemory, MEMORY_LOG_MS);
    _memoryTimer.unref();

    console.log(
      `[autoPerformance] ✅ Started\n` +
      `  🧹 Cache cleanup: every ${CLEANUP_MS / 60000} min\n` +
      `  📊 Memory log: every ${MEMORY_LOG_MS / 60000} min`
    );
  }
};
