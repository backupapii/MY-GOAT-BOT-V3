const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "qr",
    aliases: ["makeqr", "qrmake"],
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate a QR code from any text or URL" },
    longDescription: { en: "Generates a QR code image from the provided text, URL, or any string." },
    category: "utility",
    guide: { en: "{pn} <text or URL>" }
  },

  onStart: async function ({ message, event, args }) {
    if (!args.length) return message.reply("❌ Please provide text or URL.\nExample: -qr https://facebook.com");
    const text = args.join(" ").trim();

    try {
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `qr_${Date.now()}.png`);

      await QRCode.toFile(filePath, text, {
        color: { dark: "#000000", light: "#FFFFFF" },
        width: 400,
        margin: 2
      });

      await message.reply({
        body: `📱 QR Code Generated\n🔗 Content: ${text.length > 50 ? text.substring(0, 47) + "..." : text}`,
        attachment: fs.createReadStream(filePath)
      });
      setTimeout(() => fs.remove(filePath).catch(() => {}), 30000);
    } catch (err) {
      console.error("[qr]", err.message);
      message.reply("❌ Failed to generate QR code.");
    }
  }
};
