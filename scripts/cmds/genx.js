const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

const IMAGE_APIS = [
  {
    name: "DallE Tau",
    fetch: async (prompt) => {
      const res = await axios.get(`https://dall-e-tau-steel.vercel.app/kshitiz?prompt=${encodeURIComponent(prompt)}`, { timeout: 30000 });
      const imageUrl = res.data.response;
      if (!imageUrl) throw new Error('no URL');
      const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 60000 });
      if (imgRes.data.byteLength < 2000) throw new Error('empty');
      return Buffer.from(imgRes.data);
    }
  },
  {
    name: "Pollinations Flux",
    fetch: async (prompt) => {
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${seed}`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
      if (res.data.byteLength < 2000) throw new Error('empty');
      return Buffer.from(res.data);
    }
  },
  {
    name: "Pollinations Turbo",
    fetch: async (prompt) => {
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=turbo&width=1024&height=1024&nologo=true&seed=${seed}`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
      if (res.data.byteLength < 2000) throw new Error('empty');
      return Buffer.from(res.data);
    }
  },
  {
    name: "Pollinations Flux-Realism",
    fetch: async (prompt) => {
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux-realism&width=1024&height=1024&nologo=true&seed=${seed}`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
      if (res.data.byteLength < 2000) throw new Error('empty');
      return Buffer.from(res.data);
    }
  },
  {
    name: "Pollinations Default",
    fetch: async (prompt) => {
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
      if (res.data.byteLength < 2000) throw new Error('empty');
      return Buffer.from(res.data);
    }
  },
];

module.exports = {
  config: {
    name: "genx",
    aliases: [],
    version: "2.0",
    author: "Vex_Kshitiz / SHAKIL",
    countDown: 20,
    role: 0,
    longDescription: { en: "Generate images using AI with 5-API fallback chain" },
    category: "ai",
    guide: { en: "{pn} <prompt>" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(' ').trim();
    if (!prompt) return api.sendMessage("❌ Please provide a prompt.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const cacheDir = path.join(__dirname, 'cache');
    await fs.ensureDir(cacheDir);
    const imgPath = path.join(cacheDir, `genx_${Date.now()}.jpg`);

    let lastError = "";
    for (const apiSrc of IMAGE_APIS) {
      try {
        const buf = await apiSrc.fetch(prompt);
        await fs.writeFile(imgPath, buf);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        await api.sendMessage({ body: `🖼️ via ${apiSrc.name}`, attachment: fs.createReadStream(imgPath) }, event.threadID, event.messageID);
        setTimeout(() => fs.remove(imgPath).catch(() => {}), 30000);
        return;
      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage(`❌ All ${IMAGE_APIS.length} APIs failed. ${lastError}`, event.threadID, event.messageID);
  }
};
