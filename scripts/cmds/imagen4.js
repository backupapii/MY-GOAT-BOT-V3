const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const IMAGE_APIS = [
  {
    name: "NeoKEX Imagen 4",
    fetch: async (prompt) => {
      const url = `https://neokex-img-api.vercel.app/generate?prompt=${encodeURIComponent(prompt.trim())}&m=imagen4`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 50000 });
      if (res.data.byteLength < 2000) throw new Error('empty response');
      return Buffer.from(res.data);
    }
  },
  {
    name: "Pollinations Flux",
    fetch: async (prompt) => {
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${seed}`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
      if (res.data.byteLength < 2000) throw new Error('empty response');
      return Buffer.from(res.data);
    }
  },
  {
    name: "Pollinations Flux-Realism",
    fetch: async (prompt) => {
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux-realism&width=1024&height=1024&nologo=true&seed=${seed}`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
      if (res.data.byteLength < 2000) throw new Error('empty response');
      return Buffer.from(res.data);
    }
  },
  {
    name: "Pollinations Turbo",
    fetch: async (prompt) => {
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=turbo&width=1024&height=1024&nologo=true&seed=${seed}`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
      if (res.data.byteLength < 2000) throw new Error('empty response');
      return Buffer.from(res.data);
    }
  },
  {
    name: "Pollinations Default",
    fetch: async (prompt) => {
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
      if (res.data.byteLength < 2000) throw new Error('empty response');
      return Buffer.from(res.data);
    }
  },
];

module.exports = {
  config: {
    name: "imagen4",
    aliases: ["img4", "gen4"],
    version: "2.0",
    author: "NeoKEX / SHAKIL",
    countDown: 15,
    role: 0,
    longDescription: "Generate a high-quality image using Imagen 4 with 5-API fallback chain.",
    category: "ai-image",
    guide: { en: "{pn} <prompt>" }
  },

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply("❌ Please provide a prompt to generate an image.");

    message.reaction("🎨", event.messageID);

    const cacheDir = path.join(__dirname, 'cache');
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `imagen4_${Date.now()}.png`);

    let lastError = "";
    for (const api of IMAGE_APIS) {
      try {
        const imgBuf = await api.fetch(prompt);
        await fs.writeFile(filePath, imgBuf);
        message.reaction("✅", event.messageID);
        await message.reply({
          body: `✨ Image Generated via ${api.name}`,
          attachment: fs.createReadStream(filePath)
        });
        setTimeout(() => fs.remove(filePath).catch(() => {}), 30000);
        return;
      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    message.reaction("❌", event.messageID);
    message.reply(`❌ All ${IMAGE_APIS.length} image APIs failed.\nLast error: ${lastError}`);
  }
};
