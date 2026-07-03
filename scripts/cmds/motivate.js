const axios = require("axios");

const MOTIVATIONS = [
  "🌟 তুমি পারবে! শুধু বিশ্বাস রাখো নিজের উপর।",
  "💪 প্রতিটি দিন একটি নতুন সুযোগ। আজকের দিনটাকে অর্থবহ করো।",
  "🔥 ব্যর্থতা শেষ নয়। উঠে দাঁড়াও, আবার চেষ্টা করো!",
  "🚀 স্বপ্ন দেখো বড়, কাজ করো কঠিন, সাফল্য আসবেই।",
  "🌈 কঠিন সময় চিরকাল থাকে না। তুমি এর চেয়ে শক্তিশালী।",
  "⭐ তুমি যা ভাবো তুমি তাই হও। ইতিবাচক চিন্তা করো।",
  "🏆 আজকের কষ্টই আগামীকালের সাফল্যের ভিত্তি।",
  "💡 Don't stop when you're tired. Stop when you're done.",
  "🌊 Waves don't give up on shore. Neither should you.",
  "🦁 Be the energy you want to attract.",
  "🌺 Every morning is a fresh start. Make it count.",
  "⚡ The harder you work, the luckier you get.",
  "🎯 Focus on progress, not perfection.",
  "🌟 You didn't come this far only to come this far.",
  "💎 Pressure makes diamonds. Keep going!",
  "🔑 Success is a door and persistence is the key.",
  "🌻 Bloom where you are planted.",
  "🦋 Transform your pain into power.",
  "🎵 Life is short. Make it sweet.",
  "🏔️ The mountain is steep but the view from the top is worth it."
];

module.exports = {
  config: {
    name: "motivate",
    aliases: ["moti", "motiv"],
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get a motivational message" },
    longDescription: { en: "Sends a random motivational or inspirational message to lift your spirits." },
    category: "fun",
    guide: { en: "{pn} [@mention]" }
  },

  onStart: async function ({ message, event }) {
    const msg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    const mentions = Object.keys(event.mentions || {});

    if (mentions.length) {
      const name = event.mentions[mentions[0]];
      return message.reply(`Hey ${name}! 💌\n\n${msg}`);
    }
    return message.reply(msg);
  }
};
