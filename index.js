/**
 * SHAKIL BOT V3
 * Customized by 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
 * FCA: xnil-ypb-fca
 * Base: GoatBot V2
 */

const { spawn } = require("child_process");
const http = require("http");
const https = require("https");
const log = require("./logger/log.js");

// ——— IMMEDIATE HEALTH SERVER (Railway / Render / Koyeb / Replit) ————————————
// Binds to process.env.PORT (injected by platform) OR falls back to 3000.
// Starts BEFORE bot login so health checks always pass during startup.
const HEALTH_PORT = Number(process.env.PORT) || 3000;

const healthServer = http.createServer((req, res) => {
        const uptime = process.uptime();
        const mem = process.memoryUsage();

        const body = JSON.stringify({
                status: "ok",
                bot: "SHAKIL BOT V3",
                author: "SHAKIL-HOSSEN",
                uptime_seconds: Math.floor(uptime),
                memory_mb: Math.round(mem.heapUsed / 1024 / 1024),
                timestamp: new Date().toISOString()
        });

        res.writeHead(200, {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "X-Content-Type-Options": "nosniff"
        });
        res.end(body);
});

healthServer.listen(HEALTH_PORT, "0.0.0.0", () => {
        console.log(`[HEALTH] Health server listening on 0.0.0.0:${HEALTH_PORT}`);

        // Show UptimeRobot setup URL (Render injects RENDER_EXTERNAL_URL, Railway injects RAILWAY_PUBLIC_DOMAIN)
        const renderUrl  = process.env.RENDER_EXTERNAL_URL;
        const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN
                ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
                : null;
        const replitUrl  = process.env.REPLIT_DEV_DOMAIN
                ? `https://${process.env.REPLIT_DEV_DOMAIN}`
                : null;
        const publicUrl  = renderUrl || railwayUrl || replitUrl;

        if (publicUrl) {
                console.log(`[HEALTH] Public URL: ${publicUrl}/health`);
                console.log(`[HEALTH] ─────────────────────────────────────────────────────`);
                console.log(`[HEALTH]  ⏰ Keep bot ONLINE 24/7 — set up a free ping monitor:`);
                console.log(`[HEALTH]  → UptimeRobot: https://uptimerobot.com  (free, every 5 min)`);
                console.log(`[HEALTH]  → cron-job.org: https://cron-job.org   (free, every 1 min)`);
                console.log(`[HEALTH]  → Ping URL: ${publicUrl}/health`);
                console.log(`[HEALTH] ─────────────────────────────────────────────────────`);
        }
});

healthServer.on("error", (e) => {
        if (e.code === "EADDRINUSE") {
                console.warn(`[HEALTH] Port ${HEALTH_PORT} already in use — health server skipped`);
        } else {
                console.error(`[HEALTH] Server error:`, e.message);
        }
});

// ——— SELF-PING (keeps Render / Railway free tier awake) ————————————————————
// Pings our own health endpoint every 14 minutes.
// Render free tier sleeps after 15 min of no requests → this prevents that.
// On Replit use UptimeRobot instead (external ping needed).
function startSelfPing() {
        const renderUrl  = process.env.RENDER_EXTERNAL_URL;
        const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN
                ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
                : null;
        const replitUrl  = process.env.REPLIT_DEV_DOMAIN
                ? `https://${process.env.REPLIT_DEV_DOMAIN}`
                : null;
        const pingTarget = renderUrl || railwayUrl || replitUrl;

        if (!pingTarget) return;

        // Replit proxy drops at ~10-15min → ping every 4min to stay alive
        // Render/Railway free tier sleeps after 15min → ping every 14min
        const PING_MS = replitUrl && !renderUrl && !railwayUrl
                ? 4 * 60 * 1000   // 4 minutes for Replit
                : 14 * 60 * 1000; // 14 minutes for Render/Railway

        setTimeout(() => {
                setInterval(() => {
                        const url = `${pingTarget}/health`;
                        const client = url.startsWith("https") ? https : http;
                        client.get(url, (res) => {
                                res.resume(); // consume response
                        }).on("error", () => {}); // ignore errors silently
                }, PING_MS);
        }, 60 * 1000); // wait 1 minute after startup before first ping
}

startSelfPing();

// ——— START BOT ———————————————————————————————————————————————————————————————
function startProject() {
        const child = spawn("node", ["Goat.js"], {
                cwd: __dirname,
                stdio: "inherit",
                shell: true
        });

        child.on("close", (code) => {
                if (code == 2) {
                        log.info("BOT", "Restarting Project...");
                        startProject();
                }
        });
}

startProject();
