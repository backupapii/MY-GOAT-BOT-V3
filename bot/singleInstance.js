/**
 * SHAKIL BOT V3 — Single Instance Guard
 * Ensures only ONE bot instance runs at a time.
 * When a new instance starts, it claims the lock.
 * Any older instance detects the new lock and shuts down within 60 seconds.
 */

const fs = require('fs');
const path = require('path');

const LOCK_FILE  = path.join(process.cwd(), '.instance.lock');
const RENEW_MS   = 5 * 1000;   // renew lock every 5s
const SHUTDOWN_DELAY_MS = 8 * 1000; // old instance exits in 8s (was 60s — dual-login causes FB suspension)

function readLock() {
  try { return JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8')); }
  catch { return null; }
}

function writeLock(id) {
  fs.writeFileSync(LOCK_FILE, JSON.stringify({
    instanceId: id,
    pid: process.pid,
    startedAt: Date.now()
  }), 'utf8');
}

function removeLock(id) {
  const cur = readLock();
  if (cur && cur.instanceId === id) {
    try { fs.unlinkSync(LOCK_FILE); } catch {}
  }
}

function start() {
  const myId = `${Date.now()}_${process.pid}`;
  let shuttingDown = false;

  // --- claim lock immediately (this instance is newest) ---
  writeLock(myId);
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[INSTANCE GUARD] New instance started: ${myId}`);
  console.log(`[INSTANCE GUARD] Any older instance will shut down in ${SHUTDOWN_DELAY_MS / 1000}s`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // --- renew lock & watch for newer instances ---
  const interval = setInterval(() => {
    if (shuttingDown) return;

    const cur = readLock();
    if (!cur || cur.instanceId === myId) {
      // still ours — renew
      writeLock(myId);
      return;
    }

    // A newer instance claimed the lock
    if (shuttingDown) return;
    shuttingDown = true;
    clearInterval(interval);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[INSTANCE GUARD] Newer instance detected (ID: ${cur.instanceId})`);
    console.log(`[INSTANCE GUARD] This OLD instance (${myId}) will exit in ${SHUTDOWN_DELAY_MS / 1000}s...`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    setTimeout(() => {
      console.log(`[INSTANCE GUARD] Graceful shutdown — old instance exiting.`);
      process.exit(0);
    }, SHUTDOWN_DELAY_MS);
  }, RENEW_MS);

  // keep timer alive (don't block event loop exit)
  interval.unref();

  // cleanup on normal exit
  process.on('exit',    () => removeLock(myId));
  process.on('SIGTERM', () => { removeLock(myId); });
  process.on('SIGINT',  () => { removeLock(myId); });

  return myId;
}

module.exports = { start };
