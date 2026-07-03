const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => { throw new Error("❌ API সাময়িকভাবে বন্ধ আছে। একটু পরে try করুন।"); };
/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "tokai",
    aliases: ["toqai"],
    version: "1.7",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    role: 2,
    category: "fun",
    cooldown: 10,
    guide: "[mention/reply/UID]",
  },

  onStart: async function({ api, event, args }) {
    const { senderID, mentions, threadID, messageID, messageReply } = event;
    let id;
    if (Object.keys(mentions).length > 0) {
      id = Object.keys(mentions)[0];
    } else if (messageReply) {
      id = messageReply.senderID;
    } else if (args[0]) {
      id = args[0]; 
    } else {
      return api.sendMessage(
        "❌ Mention, reply, or give UID to make tokai someone",
        threadID,
        messageID
      );
    }

    try {
            const url = `${apiUrl}/api/tokai?user=${id}`;

      const response = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `tokai_${id}.png`);
      fs.writeFileSync(filePath, response.data);
      
      api.sendMessage(
        { attachment: fs.createReadStream(filePath), body: "Here's your tokai image 🐸" },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );

    } catch (err) {
      api.sendMessage(`🥹error, contact MahMUD.`, threadID, messageID);
    }
  }
};
