const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "color",
    aliases: ["colorcard", "hex"],
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate a color card from a hex code or random" },
    longDescription: { en: "Creates a color card image for a given hex color code or a random color." },
    category: "utility",
    guide: { en: "{pn} [hex] — e.g. {pn} ff5733 | {pn} (random)" }
  },

  onStart: async function ({ message, args }) {
    let hex = args[0] ? args[0].replace("#", "").trim() : null;

    if (!hex || !/^[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(hex)) {
      hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, "0");
    }
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const textColor = luminance > 0.5 ? "#222222" : "#FFFFFF";

    const canvas = createCanvas(400, 220);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = `#${hex}`;
    ctx.fillRect(0, 0, 400, 220);

    ctx.fillStyle = textColor;
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`#${hex.toUpperCase()}`, 200, 100);
    ctx.font = "22px sans-serif";
    ctx.fillText(`RGB(${r}, ${g}, ${b})`, 200, 145);
    ctx.font = "16px sans-serif";
    ctx.fillText(`R:${r}  G:${g}  B:${b}`, 200, 185);

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `color_${Date.now()}.png`);
    const buf = canvas.toBuffer("image/png");
    await fs.writeFile(filePath, buf);

    await message.reply({
      body: `🎨 Color: #${hex.toUpperCase()}\nRGB(${r}, ${g}, ${b})`,
      attachment: fs.createReadStream(filePath)
    });
    setTimeout(() => fs.remove(filePath).catch(() => {}), 30000);
  }
};
