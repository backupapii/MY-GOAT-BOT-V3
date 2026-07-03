const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "aiphoto",
    aliases: ["aip"],
    version: "1.1",
    author: "Neoaz ゐ",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Generate AI photo-realistic image" },
    longDescription: { en: "Generate photo-realistic images using Flux Realism model via Pollinations" },
    category: "image",
    guide: {
      en: "{pn} <prompt>\nExample: {pn} a realistic portrait of a girl"
    }
  },

  onStart: async function ({ message, event, api, args }) {
    if (!args.length) return message.reply("Please provide a prompt.\nExample: -aiphoto a realistic mountain landscape");

    const prompt = args.join(" ").trim();

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const seed = Math.floor(Math.random() * 999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux-realism&width=1024&height=1024&nologo=true&seed=${seed}`;

      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 120000 });

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `aiphoto_${Date.now()}.jpg`);
      await fs.writeFile(filePath, Buffer.from(imgRes.data));

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await message.reply({
        body: `📷 AI Photo Generated\n📝 Prompt: ${prompt}`,
        attachment: fs.createReadStream(filePath)
      });
      setTimeout(() => fs.remove(filePath).catch(() => {}), 30000);

    } catch (err) {
      console.error("[aiphoto]", err.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ Image generation failed. Try again later.");
    }
  }
};
