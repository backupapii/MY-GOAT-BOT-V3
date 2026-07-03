const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// 🔥 global control variable
global.tagStop = false;

module.exports = {
  config: {
    name: "tag2",
    category: "GROUP",
    role: 2,
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    description: {
      en: "Tag system with stop command + delay"
    }
  },

  onStart: async ({ api, event, args, threadsData, usersData }) => {
    const { threadID, messageID, messageReply, mentions } = event;

    try {

      // 🔴 STOP COMMAND
      if (args[0]?.toLowerCase() === "stop") {
        global.tagStop = true;
        return api.sendMessage("🛑 Tag system stopped!", threadID, messageID);
      }

      // 🟢 START RESET
      global.tagStop = false;

      let count = parseInt(args.find(a => !isNaN(a))) || 1;
      if (count > 30) count = 30;
      if (count < 1) count = 1;

      const text = args.filter(a => isNaN(a) && a.toLowerCase() !== "@everyone").join(" ")
        || "🔥 tagged you";

      const threadData = await threadsData.get(threadID);
      const members = threadData.members || [];

      let tagUsers = [];

      // 🔥 @everyone
      if (args[0]?.toLowerCase() === "@everyone") {
        tagUsers = members.map(m => ({
          id: m.userID,
          name: m.name
        }));
      }

      // 🔥 mention
      else if (mentions && Object.keys(mentions).length > 0) {
        tagUsers = Object.keys(mentions).map(uid => ({
          id: uid,
          name: mentions[uid]
        }));
      }

      // 🔥 reply
      else if (messageReply) {
        const uid = messageReply.senderID;
        const name = await usersData.getName(uid);
        tagUsers = [{ id: uid, name }];
      }

      else {
        return api.sendMessage(
          "⚠️ Use @user / @everyone / reply / stop",
          threadID,
          messageID
        );
      }

      // 🚀 LOOP WITH STOP + DELAY
      for (let i = 0; i < count; i++) {

        // 🔴 STOP CHECK
        if (global.tagStop) {
          global.tagStop = false;
          return api.sendMessage("🛑 Tag stopped successfully!", threadID);
        }

        const u = tagUsers[i % tagUsers.length];

        await api.sendMessage(
          {
            body: `${text} (${i + 1})`,
            mentions: [{
              id: u.id,
              tag: u.name
            }]
          },
          threadID
        );

        await sleep(1500); // 1.5 sec delay
      }

    } catch (err) {
      return api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    }
  }
};
