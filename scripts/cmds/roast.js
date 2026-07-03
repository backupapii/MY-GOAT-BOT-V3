const axios = require("axios");

const ROASTS = [
  "তুই এত বোকা যে তোকে দেখলে বোকারাও হাসে 😂",
  "তোর মাথায় যদি মস্তিষ্ক থাকত, তাহলে হয়তো কাজে লাগত 🧠",
  "তুই সেই মানুষ যাকে দেখলে চিন্তা করতে হয় — পৃথিবী আসলে কতটা ভুল জায়গা 😅",
  "তোর সাথে কথা বলতে বলতে আমার IQ কমে যাচ্ছে 📉",
  "You are proof that even evolution can go backwards 🐒",
  "I'd explain it to you, but I left my crayons at home 🖍️",
  "You're not stupid; you just have bad luck thinking 🍀",
  "Brains aren't everything. In your case, they're nothing 💀",
  "I've met smarter people after taking sleeping pills 💊",
  "If you were any slower, you'd be going backwards ⏪",
  "You have the face of a saint... a Saint Bernard 🐶",
  "I'd give you a nasty look, but you already have one 😐",
  "You're like a cloud — when you disappear, it's a beautiful day ☀️",
  "If laughter is the best medicine, your face must be curing diseases 💊",
  "You bring everyone so much joy when you leave the room 🚪",
  "তুই এত লম্বা লম্বা কথা বলিস, কিন্তু শেষে কাজের কিছু হয় না 🗣️",
  "তোকে দেখে মনে হয় জীবনটা সত্যিই unfair 😔",
  "Your WiFi password is probably your only secret 📶",
  "তুই কি নিজেও জানিস তুই কতটা পেকে গেছিস? 🥲",
  "I'd roast you harder, but my mom told me not to burn trash 🔥🗑️"
];

module.exports = {
  config: {
    name: "roast",
    aliases: ["burnit", "insult"],
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Roast someone with a funny insult" },
    longDescription: { en: "Sends a random funny roast. Mention someone to roast them!" },
    category: "fun",
    guide: { en: "{pn} [@mention or reply]" }
  },

  onStart: async function ({ message, event, api }) {
    const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    const mentions = Object.keys(event.mentions || {});

    if (mentions.length) {
      const name = event.mentions[mentions[0]];
      return message.reply(`🔥 Hey ${name}! ${roast}`);
    }
    if (event.messageReply) {
      return message.reply(`🔥 ${roast}`);
    }
    return message.reply(`🔥 ${roast}`);
  }
};
