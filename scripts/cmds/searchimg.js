const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "searchimg",
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: "Search HD images",
    longDescription: "Search and send 6 HD images from Pexels",
    category: "image",
    guide: "{pn} <query>"
  },

  onStart: async function ({ message, args }) {

    if (!args[0])
      return message.reply("❌ | Usage:\n/searchimg cat");

    const query = args.join(" ");

    // 👇 তোমার Pexels API Key এখানে বসাবে
    const PEXELS_API_KEY = "xbqnRtIRv2s5IcTSrC493fmgszwfa5cEOc3dowZjLfG1eueAkm14cNXZ";

    try {

      const res = await axios.get(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6`,
        {
          headers: {
            Authorization: PEXELS_API_KEY
          }
        }
      );

      const photos = res.data.photos;

      if (!photos || photos.length === 0)
        return message.reply("❌ | No images found.");

      const attachments = [];

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir))
        fs.mkdirSync(cacheDir);

      for (let i = 0; i < photos.length; i++) {

        const imgUrl = photos[i].src.large2x;

        const imgPath = path.join(cacheDir, `pexels_${Date.now()}_${i}.jpg`);

        const img = await axios.get(imgUrl, {
          responseType: "arraybuffer"
        });

        fs.writeFileSync(imgPath, Buffer.from(img.data));

        attachments.push(fs.createReadStream(imgPath));
      }

      await message.reply({
        body: `📸 6 HD Images Result For: ${query}`,
        attachment: attachments
      });

      setTimeout(() => {
        fs.readdirSync(cacheDir).forEach(file => {
          if (file.startsWith("pexels_"))
            fs.unlinkSync(path.join(cacheDir, file));
        });
      }, 10000);

    } catch (e) {
      console.log(e);
      return message.reply("❌ | Failed to fetch images.");
    }
  }
};
