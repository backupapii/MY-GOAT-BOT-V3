const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const BG = "https://i.imgur.com/gz32W84.jpeg";

module.exports = {
  config: {
    name: "vcpp",
    version: "5.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    role: 0,
    countDown: 5,
    category: "image",
    description: "Pro esports banner generator"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply || !messageReply.attachments?.[0]) {
      return api.sendMessage("❌ Reply to a photo first!", threadID, messageID);
    }

    if (!args.length) {
      return api.sendMessage("❌ Use: /vcpp XAIKO | SIYAM | KO KING TOP VOICE G", threadID, messageID);
    }

    try {
      const input = args.join(" ").split("|").map(e => e.trim());
      const upName = input[0] || "XAIKO";
      const downName = input[1] || "SIYAM";
      const groupName = input[2] || "KO KING TOP VOICE G";

      // USER IMAGE
      const imgURL = messageReply.attachments[0].url;
      const img = await axios.get(imgURL, { responseType: "arraybuffer" });
      const avatar = await loadImage(img.data);

      // BG IMAGE
      const bgData = await axios.get(BG, { responseType: "arraybuffer" });
      const bg = await loadImage(bgData.data);

      const canvas = createCanvas(1000, 1000);
      const ctx = canvas.getContext("2d");

      // ================= BACKGROUND ONLY =================
      ctx.drawImage(bg, 0, 0, 1000, 1000);

      // ================= TOP NAME =================
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#ffcc00";
      ctx.font = "bold 85px Sans";
      ctx.textAlign = "center";
      ctx.fillText(upName.toUpperCase(), 500, 110);
      ctx.shadowBlur = 0;

      // ================= CENTER CIRCLE FRAME =================
      const x = 500;
      const y = 500;
      const r = 230;

      // outer glow ring
      ctx.beginPath();
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 12;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 30;
      ctx.arc(x, y, r + 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 6;
      ctx.shadowColor = "#ff00ff";
      ctx.shadowBlur = 20;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();

      // clip PERFECT IMAGE FIT
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();

      // IMPORTANT: fill full circle (no gap)
      ctx.drawImage(avatar, x - r, y - r, r * 2, r * 2);

      ctx.restore();

      // ================= CURVED GROUP NAME (FAKE STYLE) =================
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 35px Sans";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 10;
      ctx.textAlign = "center";

      const letters = groupName.toUpperCase().split("");
      const radius = 310;
      const startAngle = -Math.PI / 2 - 0.6;

      letters.forEach((letter, i) => {
        const angle = startAngle + (i * 0.12);
        const tx = 500 + radius * Math.cos(angle);
        const ty = 500 + radius * Math.sin(angle);

        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(letter, 0, 0);
        ctx.restore();
      });

      // ================= BOTTOM NAME =================
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 75px Sans";
      ctx.textAlign = "center";
      ctx.fillText(downName.toUpperCase(), 500, 900);

      const buffer = canvas.toBuffer("image/png");

      const file = path.join(__dirname, "vcpp.png");
      fs.writeFileSync(file, buffer);

      return api.sendMessage(
        {
          body: "🔥 PRO ESPORTS VCPP READY",
          attachment: fs.createReadStream(file)
        },
        threadID,
        () => fs.unlinkSync(file),
        messageID
      );

    } catch (e) {
      console.log(e);
      return api.sendMessage("❌ Error generating image", threadID, messageID);
    }
  }
};
