const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => { throw new Error("❌ API সাময়িকভাবে বন্ধ আছে। একটু পরে try করুন।"); };
module.exports = {
  config: {
    name: "horny",
    aliases: ["hornyvid", "hvideo"],
    version: "1.7",
    role: 0,
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    category: "adult",
    guide: {
      en: "Use {pn} to get a random horny video."
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const apiUrl = await mahmud();
      const res = await axios.get(`${apiUrl}/api/album/videos/horny2?userID=${event.senderID}`);
      if (!res.data.success || !res.data.videos.length)
        return api.sendMessage("❌ | No videos found.", event.threadID, event.messageID);

      const url = res.data.videos[Math.floor(Math.random() * res.data.videos.length)];
      const filePath = path.join(__dirname, "temp_video.mp4");

      const video = await axios({
        url,
        method: "GET",
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const writer = fs.createWriteStream(filePath);
      video.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐇𝐨𝐫𝐧𝐲 𝐯𝐢𝐝𝐞𝐨 <😘",
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      writer.on("error", () => {
        api.sendMessage("❌ | Download error.", event.threadID, event.messageID);
      });
    } catch (e) {
      console.error("ERROR:", e);
      api.sendMessage("🥹error, contact MahMUD.", event.threadID, event.messageID);
    }
  }
};
