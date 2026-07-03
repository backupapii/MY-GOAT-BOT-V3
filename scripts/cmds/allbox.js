const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "allbox",
    aliases: ["allgc", "allgroup"],
    version: "2.0.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 60,
    role: 2,
    shortDescription: "Manage all joined groups",
    longDescription: "List all groups and reply to Ban, Unban, Delete data, or remove the bot",
    category: "box chat",
    guide: {
      en: "{pn} - List all groups\nReply: ban/unban/del/out <num or all>"
    }
  },

  onStart: async function ({ event, api, commandName }) {
    const { threadID, messageID } = event;

    try {
      const dataThreads = await api.getThreadList(100, null, ["INBOX"]);
      const groups = dataThreads.filter(thread => thread.isGroup);
      if (!groups.length) return api.sendMessage("🚫 There are currently no groups!", threadID);

      groups.sort((a, b) => b.messageCount - a.messageCount);

      let msg = "🎭 GROUP LIST 🎭\n\n";
      const groupid = [];
      const groupName = [];

      groups.forEach((g, i) => {
        msg += `${i + 1}. ${g.name || "Unnamed"}\n🔰 TID: ${g.threadID}\n💌 Msgs: ${g.messageCount}\n\n`;
        groupid.push(g.threadID);
        groupName.push(g.name || "Unnamed");
      });

      msg += "📝 Reply: <ban | unban | del | out> <num or all>";

      api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          groupid,
          groupName,
          unsendTimeout: setTimeout(() => api.unsendMessage(info.messageID).catch(() => {}), this.config.countDown * 1000)
        });
      }, messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Error fetching group list.", threadID);
    }
  },

  onReply: async function ({ event, Reply, api }) {
    const { author, groupid, groupName, messageID } = Reply;
    if (event.senderID !== author) return;

    const args = event.body.trim().toLowerCase().split(/\s+/);
    clearTimeout(Reply.unsendTimeout);

    const action = args[0];
    const indexArg = args[1];

    if (!["ban", "unban", "del", "out"].includes(action)) {
      return api.sendMessage("❌ Invalid action. Use: ban, unban, del, out", event.threadID);
    }

    async function processGroup(act, i) {
      const idgr = groupid[i];
      const gName = groupName[i];
      const Threads = global.GoatBot.Threads;

      if (act === "ban") {
        try {
          const data = (await Threads.getData(idgr)).data || {};
          data.banned = 1;
          data.dateAdded = moment.tz("Asia/Dhaka").format("HH:mm:ss L");
          await Threads.setData(idgr, { data });
          global.data.threadBanned.set(idgr, { dateAdded: data.dateAdded });
          api.sendMessage(`✅ Banned: ${gName}`, event.threadID);
        } catch (e) { api.sendMessage(`⚠️ Ban error: ${gName}`, event.threadID); }
      }

      if (act === "unban") {
        try {
          const data = (await Threads.getData(idgr)).data || {};
          data.banned = 0;
          data.dateAdded = null;
          await Threads.setData(idgr, { data });
          global.data.threadBanned.delete(idgr);
          api.sendMessage(`✅ Unbanned: ${gName}`, event.threadID);
        } catch (e) { api.sendMessage(`⚠️ Unban error: ${gName}`, event.threadID); }
      }

      if (act === "del") {
        try {
          await Threads.delData(idgr);
          api.sendMessage(`✅ Data deleted: ${gName}`, event.threadID);
        } catch (e) { api.sendMessage(`⚠️ Del error: ${gName}`, event.threadID); }
      }

      if (act === "out") {
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), idgr);
          api.sendMessage(`✅ Left group: ${gName}`, event.threadID);
        } catch (e) { api.sendMessage(`⚠️ Cannot leave: ${gName}`, event.threadID); }
      }
    }

    if (indexArg === "all") {
      for (let i = 0; i < groupid.length; i++) {
        await processGroup(action, i);
      }
      return api.sendMessage(`✅ ${action.toUpperCase()} executed on all ${groupid.length} groups.`, event.threadID);
    } else {
      const index = parseInt(indexArg) - 1;
      if (isNaN(index) || index < 0 || index >= groupid.length) {
        return api.sendMessage("❌ Invalid number!", event.threadID);
      }
      await processGroup(action, index);
    }

    api.unsendMessage(messageID).catch(() => {});
  }
};
