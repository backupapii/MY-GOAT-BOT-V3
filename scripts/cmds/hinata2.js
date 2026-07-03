const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "hinata2",
    version: "1.1",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    category: "image",
    guide: { en: "{pn} @mention/reply" }
  },

  onStart: async function ({ api, event, message }) {
    const uid =
      event.messageReply?.senderID ||
      Object.keys(event.mentions || {})[0] ||
      event.senderID;

    const loading = await message.reply("⏳ Creating image...");

    try {
      // ✅ FIXED PROFILE PIC (HD fallback)
      const avatarURL = `https://graph.facebook.com/${uid}/picture?width=720&height=720`;
      const avatarBuffer = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatar = await loadImage(Buffer.from(avatarBuffer.data));

      // Hinata BG
      const bg = await loadImage("https://i.imgur.com/zTkguWx.jpeg");

      const canvas = createCanvas(900, 900);
      const ctx = canvas.getContext("2d");

      // BG
      ctx.drawImage(bg, 0, 0, 900, 900);

      // 🔥 SMALLER DP POSITION FIX
      const centerX = 450;
      const centerY = 380;
      const radius = 120; // 👉 ছোট করা হয়েছে (fix)

      // glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,200,255,0.25)";
      ctx.fill();

      // circle clip (SMALL FIX)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // USER IMAGE (FIX SCALE)
      ctx.drawImage(
        avatar,
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2
      );

      ctx.restore();

      // SAVE
      const filePath = path.join(__dirname, "cache", `hinata2_${uid}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer());

      await message.reply({
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);
      await api.unsendMessage(loading.messageID);

    } catch (e) {
      console.log(e);
      message.reply("❌ Failed to generate image");
    }
  }
};
