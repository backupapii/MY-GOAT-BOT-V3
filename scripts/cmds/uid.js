const axios = require("axios");

module.exports = {
  config: {
    name: "uid",
    aliases: ["getuid", "fbid", "userid"],
    version: "2.1",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Get Facebook UID of a user" },
    longDescription: { en: "Get UID of yourself, mentioned user, reply target, or from FB profile URL" },
    category: "utility",
    guide: {
      en: "{pn}               — your own UID\n{pn} @mention        — tagged user UID\n{pn} [reply]          — reply to get UID\n{pn} [fb profile URL] — UID from URL"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID, mentions, messageReply, threadID } = event;

    // 1. Reply to a message
    if (messageReply && Object.keys(mentions || {}).length === 0 && !args[0]) {
      const uid = messageReply.senderID;
      const name = await usersData.getName(uid).catch(() => "User");
      return message.reply(
        `🆔 USER ID\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👤 Name: ${name}\n` +
        `🔢 UID: ${uid}\n` +
        `━━━━━━━━━━━━━━━━━━`
      );
    }

    // 2. Mention someone
    const mentionIDs = Object.keys(mentions || {});
    if (mentionIDs.length > 0) {
      const lines = [];
      for (const uid of mentionIDs) {
        const name = await usersData.getName(uid).catch(() => "User");
        lines.push(`👤 ${name}\n   🔢 ${uid}`);
      }
      return message.reply(
        `🆔 USER ID${lines.length > 1 ? "s" : ""}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        lines.join("\n\n") +
        `\n━━━━━━━━━━━━━━━━━━`
      );
    }

    // 3. FB profile URL
    if (args[0] && (args[0].includes("facebook.com") || args[0].includes("fb.com"))) {
      try {
        await message.reply("🔍 Looking up UID...");
        let username = args[0]
          .replace(/https?:\/\/(www\.)?(facebook|fb)\.com\//, "")
          .split("?")[0].split("/")[0];
        if (!username) throw new Error("Invalid URL");

        const res = await axios.get(
          `https://graph.facebook.com/${username}?fields=id,name&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`,
          { timeout: 10000 }
        );
        if (res.data?.id) {
          return message.reply(
            `🆔 FACEBOOK UID\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `👤 Name: ${res.data.name || "Unknown"}\n` +
            `🔢 UID: ${res.data.id}\n` +
            `━━━━━━━━━━━━━━━━━━`
          );
        }
        throw new Error("No UID in response");
      } catch (e) {
        return message.reply(`❌ Could not fetch UID.\nError: ${e.message}`);
      }
    }

    // 4. Own UID
    const name = await usersData.getName(senderID).catch(() => "You");
    return message.reply(
      `🆔 YOUR USER ID\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👤 Name: ${name}\n` +
      `🔢 UID: ${senderID}\n` +
      `🧵 Thread ID: ${threadID}\n` +
      `━━━━━━━━━━━━━━━━━━`
    );
  }
};
