const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "uff2",
    aliases: [],
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    version: "2.0",
    cooldowns: 5,
    role: 2,
    shortDescription: "18+ tiktok video",
    longDescription: "18+ tiktok video",
    category: "18+",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, message }) {
    const apiUrl = "https://only-tik.vercel.app/api/random";

    try {
      const response = await axios.get(apiUrl, { timeout: 15000 });
      const videoUrl = response.data?.videoUrl || response.data?.url;
      if (!videoUrl) return message.reply("❌ Video পাওয়া যায়নি, আবার try করো।");

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const tempVideoPath = path.join(cacheDir, `uff_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempVideoPath);
      const videoResponse = await axios.get(videoUrl, { responseType: "stream", timeout: 30000 });
      videoResponse.data.pipe(writer);

      writer.on("finish", () => {
        const stream = fs.createReadStream(tempVideoPath);
        message.reply({ body: "", attachment: stream }, () => {
          try { fs.unlinkSync(tempVideoPath); } catch {}
        });
      });

      writer.on("error", () => {
        message.reply("❌ Video download error, আবার try করো।");
      });

    } catch (error) {
      message.reply("❌ Error হয়েছে, আবার try করো।");
    }
  }
};
