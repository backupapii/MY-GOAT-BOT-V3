const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytSearch = require("yt-search");

// Multi-API download attempt
const DOWNLOAD_APIS = [
  id => `https://api.vreden.my.id/api/ytmp4?url=https://www.youtube.com/watch?v=${id}`,
  id => `https://api.betabotz.eu.org/api/download/ytmp4?url=https://www.youtube.com/watch?v=${id}&apikey=${process.env.BETABOTZ_API_KEY || "lalilulelo"}`,
  id => `https://api.nexoracle.com/downloader/ytmp4?apikey=free_key&url=https://www.youtube.com/watch?v=${id}`,
];

async function downloadVideoUrl(videoId) {
  for (const getUrl of DOWNLOAD_APIS) {
    try {
      const res = await axios.get(getUrl(videoId), { timeout: 20000 });
      const dl = res.data?.result?.download?.url
        || res.data?.result?.url
        || res.data?.data?.url
        || res.data?.url
        || res.data?.download_url;
      if (dl) return dl;
    } catch (_) { continue; }
  }

  // Fallback: pipedapi
  try {
    const r = await axios.get(`https://pipedapi.kavin.rocks/streams/${videoId}`, { timeout: 15000 });
    const streams = r.data?.videoStreams || [];
    const best = streams.find(s => s.quality === "360p") || streams[0];
    if (best?.url) return best.url;
  } catch (_) {}

  throw new Error("All download sources failed. Try the song command instead.");
}

module.exports = {
  config: {
    name: "video",
    aliases: ["ytv", "ytvideo"],
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 15,
    role: 0,
    shortDescription: { en: "Search & download YouTube videos" },
    longDescription: { en: "Search YouTube by name and download the video. Uses multiple fallback APIs." },
    category: "media",
    guide: { en: "{pn} <video name>\n\nExample: -video Despacito" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;

    const query = args.join(" ").trim();
    if (!query) {
      return message.reply(
        `❌ Please provide a video name!\n\n📌 Example: -video Despacito`
      );
    }

    let tempMsg = null;
    try {
      tempMsg = await api.sendMessage(
        `🔍 Searching for: ${query}\n⏳ Please wait...`,
        threadID
      );

      // Search YouTube
      const results = await ytSearch(query);
      const videos = results?.videos || [];
      if (!videos.length) throw new Error("No results found for: " + query);

      const video = videos[0];
      const videoId = video.videoId;

      await api.unsendMessage(tempMsg.messageID).catch(() => {});
      tempMsg = await api.sendMessage(
        `🎬 Found: ${video.title}\n⏱ Duration: ${video.timestamp || "N/A"}\n⬇️ Downloading...`,
        threadID
      );

      const dlUrl = await downloadVideoUrl(videoId);
      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);

      const videoStream = await axios.get(dlUrl, {
        responseType: "arraybuffer",
        timeout: 120000,
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      await fs.writeFile(filePath, Buffer.from(videoStream.data));

      if (tempMsg) await api.unsendMessage(tempMsg.messageID).catch(() => {});

      await api.sendMessage(
        {
          body: `━━━━━━━━━━━━━━━━━━\n🎬 VIDEO READY\n━━━━━━━━━━━━━━━━━━\n📖 ${video.title}\n⏱ ${video.timestamp || "N/A"}\n👁 ${video.views?.toLocaleString() || "N/A"} views\n━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        async () => { try { await fs.unlink(filePath); } catch (_) {} },
        messageID
      );
    } catch (err) {
      if (tempMsg) await api.unsendMessage(tempMsg.messageID).catch(() => {});
      api.sendMessage(
        `❌ Video download failed!\n━━━━━━━━━━━━━━━\n${err.message}\n\n💡 Try: -song <name> for audio`,
        threadID,
        messageID
      );
    }
  }
};
