const axios = require('axios');
const yts = require("yt-search");

function getVideoID(url) {
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  const match = url.match(checkurl);
  return match ? match[1] : null;
}

// ── Video download fallback chain (5 sources) ─────────────────────────────────
async function getVideoLink(videoID) {
  const ytUrl = `https://www.youtube.com/watch?v=${videoID}`;

  // Source 1: D1PT0 dynamic base API
  try {
    const baseRes = await axios.get(
      "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json",
      { timeout: 10000 }
    );
    const diptoApi = baseRes.data.api;
    const { data } = await axios.get(`${diptoApi}/ytDl3?link=${videoID}&format=mp4`, { timeout: 30000 });
    if (data?.downloadLink) return { url: data.downloadLink, title: data.title || "Video", quality: data.quality || "HD", source: "D1PT0 API" };
  } catch (_) {}

  // Source 2: vreden API
  try {
    const res = await axios.get(`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(ytUrl)}`, { timeout: 25000 });
    const dl = res.data?.result?.download?.url || res.data?.result?.url || res.data?.url;
    if (dl) return { url: dl, title: res.data?.result?.title || "Video", quality: "360p", source: "Vreden API" };
  } catch (_) {}

  // Source 3: betabotz API
  try {
    const res = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${encodeURIComponent(ytUrl)}&apikey=lalilulelo`, { timeout: 25000 });
    const dl = res.data?.result?.url || res.data?.url;
    if (dl) return { url: dl, title: res.data?.result?.title || "Video", quality: "360p", source: "BetaBotz API" };
  } catch (_) {}

  // Source 4: nexoracle API
  try {
    const res = await axios.get(`https://api.nexoracle.com/downloader/ytmp4?apikey=free_key&url=${encodeURIComponent(ytUrl)}`, { timeout: 25000 });
    const dl = res.data?.result?.download_url || res.data?.data?.url || res.data?.url;
    if (dl) return { url: dl, title: res.data?.result?.title || "Video", quality: "360p", source: "NexOracle API" };
  } catch (_) {}

  // Source 5: pipedapi video streams
  try {
    const r = await axios.get(`https://pipedapi.kavin.rocks/streams/${videoID}`, { timeout: 20000 });
    const streams = r.data?.videoStreams || [];
    const best = streams.find(s => s.quality === "360p") || streams.find(s => s.quality === "480p") || streams[0];
    if (best?.url) return { url: best.url, title: r.data?.title || "Video", quality: best.quality || "?", source: "Piped API" };
  } catch (_) {}

  throw new Error("All 5 video download APIs failed. Try again later.");
}

// ─────────────────────────────────────────────────────────────────────────────

const config = {
  name: "video2",
  author: "MD_SHAKIL",
  version: "2.0",
  role: 0,
  description: "Download YouTube video by name or URL (5 fallback APIs)",
  usePrefix: true,
  category: "media",
  countDown: 15,
  guide: { en: "{pn} <video name or YouTube URL>" }
};

async function onStart({ api, args, event }) {
  if (!args.length) return api.sendMessage("Please provide a video name or YouTube URL.", event.threadID, event.messageID);

  let videoID, w;
  try {
    const url = args[0];
    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      videoID = getVideoID(url);
      if (!videoID) return api.sendMessage("❌ Invalid YouTube URL.", event.threadID, event.messageID);
    } else {
      const songName = args.join(' ');
      w = await api.sendMessage(`🔍 Searching "${songName}"...`, event.threadID);
      const r = await yts(songName);
      const videos = (r.videos || []).slice(0, 10);
      if (!videos.length) {
        if (w) api.unsendMessage(w.messageID).catch(() => {});
        return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
      }
      videoID = videos[0].videoId;
    }

    if (w) api.unsendMessage(w.messageID).catch(() => {});
    w = await api.sendMessage("⬇️ Downloading video, please wait...", event.threadID);

    const { url: dlUrl, title, quality, source } = await getVideoLink(videoID);

    if (w) api.unsendMessage(w.messageID).catch(() => {});

    // Try to shorten the link for display
    let shortenedLink = dlUrl;
    try {
      shortenedLink = (await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(dlUrl)}`, { timeout: 8000 })).data;
    } catch (_) {}

    await api.sendMessage({
      body: `🎬 ${title}\n✨ Quality: ${quality}\n🔗 Source: ${source}\n\n📥 Download: ${shortenedLink}`,
      attachment: await global.utils.getStreamFromURL(dlUrl, title + '.mp4')
    }, event.threadID, event.messageID);

  } catch (e) {
    if (w) api.unsendMessage(w.messageID).catch(() => {});
    api.sendMessage(`❌ ${e.message || "An error occurred."}`, event.threadID, event.messageID);
  }
}

module.exports = { config, onStart, run: onStart };
