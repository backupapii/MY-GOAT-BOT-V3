const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');
const yts = require("yt-search");

// ── Audio download fallback chain ─────────────────────────────────────────────
// Tries each source in order until one succeeds

async function getAudioUrl(videoID) {
  const ytUrl = `https://www.youtube.com/watch?v=${videoID}`;

  // Source 1: mahmudx7/HINATA dynamic base API
  try {
    const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`, { timeout: 10000 });
    const apiUrl = base.data.mahmud;
    const res = await axios.get(`${apiUrl}/api/ytb/get?id=${videoID}&type=audio`, { timeout: 25000 });
    const dl = res.data?.data?.downloadLink;
    if (dl) return { url: dl, title: res.data?.data?.title || "Audio", source: "HINATA API" };
  } catch (_) {}

  // Source 2: vreden API
  try {
    const res = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(ytUrl)}`, { timeout: 25000 });
    const dl = res.data?.result?.download?.url || res.data?.result?.url || res.data?.url;
    if (dl) return { url: dl, title: res.data?.result?.title || "Audio", source: "Vreden API" };
  } catch (_) {}

  // Source 3: betabotz API
  try {
    const res = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${encodeURIComponent(ytUrl)}&apikey=lalilulelo`, { timeout: 25000 });
    const dl = res.data?.result?.url || res.data?.url;
    if (dl) return { url: dl, title: res.data?.result?.title || "Audio", source: "BetaBotz API" };
  } catch (_) {}

  // Source 4: nexoracle API
  try {
    const res = await axios.get(`https://api.nexoracle.com/downloader/ytmp3?apikey=free_key&url=${encodeURIComponent(ytUrl)}`, { timeout: 25000 });
    const dl = res.data?.result?.download_url || res.data?.data?.url || res.data?.url;
    if (dl) return { url: dl, title: res.data?.result?.title || "Audio", source: "NexOracle API" };
  } catch (_) {}

  // Source 5: pipedapi audio streams
  try {
    const res = await axios.get(`https://pipedapi.kavin.rocks/streams/${videoID}`, { timeout: 20000 });
    const streams = res.data?.audioStreams || [];
    const best = streams.find(s => s.mimeType?.includes("audio/mp4")) || streams[0];
    if (best?.url) return { url: best.url, title: res.data?.title || "Audio", source: "Piped API" };
  } catch (_) {}

  throw new Error("All 5 audio download APIs failed. Try again later.");
}

// ── Search fallback ───────────────────────────────────────────────────────────
async function searchYT(query) {
  // Source 1: mahmud search API
  try {
    const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`, { timeout: 10000 });
    const apiUrl = base.data.mahmud;
    const res = await axios.get(`${apiUrl}/api/ytb/search?q=${encodeURIComponent(query)}`, { timeout: 20000 });
    const results = res.data?.results?.slice(0, 6);
    if (results?.length) return { results, hasThumb: true };
  } catch (_) {}

  // Source 2: yt-search package
  const r = await yts(query);
  const videos = (r.videos || []).slice(0, 6);
  if (!videos.length) throw new Error("No results found");
  return {
    results: videos.map(v => ({ id: v.videoId, title: v.title, time: v.timestamp, thumbnail: v.thumbnail })),
    hasThumb: true
  };
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  config: {
    name: "song",
    version: "2.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    description: {
      bn: "ইউটিউব থেকে গান ডাউনলোড করুন",
      en: "Download songs/audio from YouTube (5 fallback APIs)",
      vi: "Tải nhạc từ YouTube"
    },
    category: "music",
    guide: {
      bn: '   {pn} [গানের নাম বা লিঙ্ক]\n   উদাহরণ: {pn} tui chinli na amay',
      en: '   {pn} [song name or link]\n   Example: {pn} stay justin bieber',
      vi: '   {pn} [tên bài hát hoặc link]\n   Ví dụ: {pn} see you again'
    }
  },

  langs: {
    bn: {
      error: "❌ | সমস্যা হয়েছে: %1",
      noResult: "⭕ | দুঃখিত বেবি, \"%1\" এর জন্য কিছু খুঁজে পাইনি।",
      choose: "গানের তালিকা:\n\n%1\nগানের নাম্বার লিখে রিপ্লাই দিন।",
      success: "✅ | ডাউনলোড সম্পন্ন: %1"
    },
    en: {
      error: "❌ | An error occurred: %1",
      noResult: "⭕ | No search results match the keyword %1",
      choose: "Song Results:\n\n%1\nReply with a number to download.",
      success: "✅ | Successfully Downloaded: %1"
    }
  },

  onStart: async function ({ api, args, message, event, commandName, getLang }) {
    const { threadID, messageID, senderID } = event;
    const input = args.join(" ").trim();
    if (!input) return api.sendMessage("• Please provide a song name or YouTube link.", threadID, messageID);

    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

    if (checkurl.test(input)) {
      const videoID = input.match(checkurl)[1];
      api.setMessageReaction("⌛", messageID, () => {}, true);
      return handleDownload(api, threadID, messageID, videoID, getLang);
    }

    let w;
    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      w = await api.sendMessage(`🔍 Searching "${input}"...`, threadID);

      const { results, hasThumb } = await searchYT(input);
      if (!results?.length) return api.sendMessage(getLang("noResult", input), threadID, messageID);

      let msg = "";
      const attachments = [];
      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);

      for (let i = 0; i < results.length; i++) {
        msg += `${i + 1}. ${results[i].title}\nTime: ${results[i].time || "?"}\n\n`;
        if (hasThumb && results[i].thumbnail) {
          try {
            const thumbPath = path.join(cacheDir, `thumb_${senderID}_${Date.now()}_${i}.jpg`);
            const thumbRes = await axios.get(results[i].thumbnail, { responseType: 'arraybuffer', timeout: 10000 });
            fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
            attachments.push(fs.createReadStream(thumbPath));
          } catch (_) {}
        }
      }

      if (w) api.unsendMessage(w.messageID).catch(() => {});

      return api.sendMessage({
        body: getLang("choose", msg),
        attachment: attachments.length ? attachments : undefined
      }, threadID, (err, info) => {
        attachments.forEach(stream => { try { if (fs.existsSync(stream.path)) fs.unlinkSync(stream.path); } catch (_) {} });
        global.GoatBot.onReply.set(info.messageID, { commandName, author: senderID, results });
      }, messageID);

    } catch (e) {
      if (w) api.unsendMessage(w.messageID).catch(() => {});
      return api.sendMessage(getLang("error", e.message), threadID, messageID);
    }
  },

  onReply: async function ({ event, api, Reply, getLang }) {
    const { results, author } = Reply;
    if (event.senderID !== author) return;
    const choice = parseInt(event.body);
    if (isNaN(choice) || choice <= 0 || choice > results.length) return;
    const videoID = results[choice - 1].id || results[choice - 1].videoId;
    api.unsendMessage(Reply.messageID);
    api.setMessageReaction("⌛", event.messageID, () => {}, true);
    await handleDownload(api, event.threadID, event.messageID, videoID, getLang);
  }
};

async function handleDownload(api, threadID, messageID, videoID, getLang) {
  const cacheDir = path.join(__dirname, 'cache');
  await fs.ensureDir(cacheDir);
  const filePath = path.join(cacheDir, `music_${Date.now()}.mp3`);

  try {
    const { url, title, source } = await getAudioUrl(videoID);

    const response = await axios({ url, method: 'GET', responseType: 'stream', timeout: 120000 });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await api.sendMessage({
      body: `✅ ${title}\n🔗 Source: ${source}`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      api.setMessageReaction("✅", messageID, () => {}, true);
      fs.remove(filePath).catch(() => {});
    }, messageID);

  } catch (e) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(getLang("error", e.message), threadID, messageID);
    fs.remove(filePath).catch(() => {});
  }
}
