module.exports = {
  config: {
    name: "putul",
    version: "3.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    description: "100+ romantic Putul lines with Shakil signature",
    category: "love",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {

    const lines = [

      "💖 Putul তুমি আমার জীবনের সবচেয়ে সুন্দর অনুভূতি 🥰 | Shakil",
      "🌸 Putul তোমার হাসি আমার শান্তি 💕 | Shakil",
      "❤️ Putul তুমি না থাকলে সব ফাঁকা লাগে 😢 | Shakil",
      "💞 Putul তুমি আমার পৃথিবীর আলো ✨ | Shakil",
      "💘 Putul তোমাকে ছাড়া আমি কিছুই না 🥺 | Shakil",
      "🌹 Putul তুমি আমার স্বপ্নের রানী 👑 | Shakil",
      "💕 Putul তোমার কথা ভাবলেই মন ভালো হয়ে যায় 😍 | Shakil",
      "💓 Putul তুমি আমার হৃদয়ের ধুকধুকানি ❤️ | Shakil",
      "💗 Putul তুমি আমার প্রতিদিনের প্রার্থনা 🤲 | Shakil",
      "💝 Putul তুমি আমার সুখের কারণ 🥰 | Shakil",

      "💖 Putul তুমি ছাড়া দিন শুরু হয় না ☀️ | Shakil",
      "🌸 Putul তুমি আমার রাতের স্বপ্ন 🌙 | Shakil",
      "❤️ Putul তুমি আমার জীবনের গল্প 📖 | Shakil",
      "💞 Putul তুমি আমার সবকিছু 💯 | Shakil",
      "💘 Putul তোমার নাম শুনলেই হাসি আসে 😍 | Shakil",
      "🌹 Putul তুমি আমার হৃদয়ের রাজকন্যা 👑 | Shakil",
      "💕 Putul তুমি আমার অনুভূতির নাম 💓 | Shakil",
      "💓 Putul তুমি আমার হার্টবিট ❤️ | Shakil",
      "💗 Putul তুমি আমার চিরদিনের ভালোবাসা ♾️ | Shakil",
      "💝 Putul তুমি আমার পৃথিবীর সবচেয়ে সুন্দর মানুষ 🌍 | Shakil",

      "💖 Putul তোমাকে দেখলেই সব টেনশন চলে যায় 😊 | Shakil",
      "🌸 Putul তুমি আমার মনের রাজকুমারী 👑 | Shakil",
      "❤️ Putul তুমি আমার প্রতিটি শ্বাসে আছো 😌 | Shakil",
      "💞 Putul তুমি আমার জীবনের সেরা উপহার 🎁 | Shakil",
      "💘 Putul তুমি আমার দুঃখের ওষুধ 💊 | Shakil",
      "🌹 Putul তুমি আমার ভালো থাকার কারণ 😊 | Shakil",
      "💕 Putul তুমি আমার স্বপ্নের মানুষ 🌙 | Shakil",
      "💓 Putul তুমি আমার মনের শান্তি 🕊️ | Shakil",
      "💗 Putul তুমি আমার হাসির উৎস 😄 | Shakil",
      "💝 Putul তুমি আমার ভালোবাসার ঠিকানা 🏡 | Shakil",

      "💖 Putul তুমি আমার সকাল আর রাত 🌞🌙 | Shakil",
      "🌸 Putul তুমি আমার জীবনের আলো 💡 | Shakil",
      "❤️ Putul তুমি আমার জীবনের রঙ 🎨 | Shakil",
      "💞 Putul তুমি আমার প্রতিটি ভাবনা 💭 | Shakil",
      "💘 Putul তুমি আমার হৃদয়ের রাজ্য 👑 | Shakil",
      "🌹 Putul তুমি আমার ভালোবাসার গল্প 📖 | Shakil",
      "💕 Putul তুমি আমার স্বপ্নের ঠিকানা 🏡 | Shakil",
      "💓 Putul তুমি আমার অনুভূতির কেন্দ্র 💕 | Shakil",
      "💗 Putul তুমি আমার চিরস্থায়ী ভালোবাসা ♾️ | Shakil",
      "💝 Putul তুমি আমার সব স্বপ্ন পূরণ 🌈 | Shakil",

      "💖 Putul তুমি আমার চাঁদের আলো 🌙 | Shakil",
      "🌸 Putul তুমি আমার সূর্যের আলো ☀️ | Shakil",
      "❤️ Putul তুমি আমার জীবনের কবিতা ✍️ | Shakil",
      "💞 Putul তুমি আমার ভালো থাকার reason 😊 | Shakil",
      "💘 Putul তুমি আমার হৃদয়ের গান 🎶 | Shakil",
      "🌹 Putul তুমি আমার পৃথিবীর সবচেয়ে মিষ্টি মানুষ 🍭 | Shakil",
      "💕 Putul তুমি আমার মনের ভিতরের মানুষ 🥰 | Shakil",
      "💓 Putul তুমি আমার জীবনের সবচেয়ে সুন্দর অধ্যায় 📘 | Shakil",
      "💗 Putul তুমি আমার স্বপ্নের রানী 👑 | Shakil",
      "💝 Putul তুমি আমার ভালোবাসার নাম ❤️ | Shakil"

    ];

    const msg = lines[Math.floor(Math.random() * lines.length)];

    return message.reply(
`╭──── 💖 PUTUL 💖 ────╮

${msg}

╰────────────────────╯`
    );
  }
};
