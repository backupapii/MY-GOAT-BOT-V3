const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function fetchAnimeVideo(query) {
  const apis = [
    async () => {
      const res = await axios.get(`https://lyric-search-neon.vercel.app/\u{1D5E6}\u{1D5DB}\u{1D5D4}\u{1D5DE}\u{1D5DC}\u{1D5DF}-\u{1D5DB}\u{1D5E2}\u{1D5E6}\u{1D5E6}\u{1D5D8}\u{1D5E1}?keyword=${encodeURIComponent(query)}`, { timeout: 10000 });
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      return null;
    },
    async () => {
      const res = await axios.get(`https://www.tikwm.com/api/feed/search`, {
        params: { keywords: query + " anime", count: 10, cursor: 0, web: 1 },
        timeout: 10000
      });
      if (res.data?.data?.videos?.length > 0) {
        return res.data.data.videos.map(v => ({ videoUrl: v.play }));
      }
      return null;
    }
  ];

  for (const fn of apis) {
    try {
      const result = await fn();
      if (result && result.length > 0) return result;
    } catch {}
  }
  return null;
}

module.exports = {
  config: {
    name: "anisearch",
    aliases: ["ani", "aniusr"],
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Search anime edit video" },
    longDescription: { en: "Search for anime edit videos by keyword" },
    category: "media",
    guide: { en: "{pn} <query>\nExample: {pn} naruto" }
  },

  onStart: async function ({ api, event, args, message }) {
    const query = args.join(" ").trim();
    if (!query) return message.reply("⚠️ একটা keyword দাও!\nExample: anisearch naruto");

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    try {
      const modifiedQuery = `${query} anime edit`;
      const videos = await fetchAnimeVideo(modifiedQuery);

      if (!videos || videos.length === 0) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`😞 "${query}" এর কোনো anime video পাওয়া গেলো না।`);
      }

      const selected = videos[Math.floor(Math.random() * videos.length)];
      const videoUrl = selected.videoUrl || selected.play || selected.url;

      if (!videoUrl) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("❌ Video URL পাওয়া যায়নি।");
      }

      const res = await axios.get(videoUrl, { responseType: "stream", timeout: 30000 });
      const videoPath = path.join(cacheDir, `anisearch_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(videoPath);
      res.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const stat = fs.statSync(videoPath);
      if (stat.size > 26214400) {
        fs.unlinkSync(videoPath);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("⚠️ Video too large (25MB+). Try again!");
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await message.reply({
        body: `🎬 Anime Edit: ${query}`,
        attachment: fs.createReadStream(videoPath)
      });

      fs.unlink(videoPath, () => {});
    } catch (err) {
      console.error("[anisearch]", err.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`❌ Error: ${err.message}\nপরে আবার try করুন।`);
    }
  }
};
