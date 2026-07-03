module.exports = {
  config: {
    name: "ping",
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Check bot response time" },
    longDescription: { en: "Ping the bot to check if it's alive and measure response time" },
    category: "info",
    guide: { en: "{pn}" }
  },

  onStart: async ({ api, event }) => {
    const start = Date.now();
    const sent = await api.sendMessage("🏓 Pinging...", event.threadID);
    const ping = Date.now() - start;
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const secs = Math.floor(uptime % 60);
    const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    await api.editMessage(
      `🏓 Pong!\n` +
      `⚡ Response: ${ping}ms\n` +
      `⏱️ Uptime: ${hours}h ${mins}m ${secs}s\n` +
      `💾 Memory: ${mem}MB\n` +
      `✅ Bot is online!`,
      sent.messageID
    );
  }
};
