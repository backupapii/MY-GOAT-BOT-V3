const axios = require("axios");

const FALLBACK_QUOTES = [
  { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
  { q: "In the middle of every difficulty lies opportunity.", a: "Albert Einstein" },
  { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
  { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
  { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
  { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
  { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
  { q: "The way to get started is to quit talking and begin doing.", a: "Walt Disney" },
  { q: "Don't watch the clock; do what it does. Keep going.", a: "Sam Levenson" },
  { q: "You are never too old to set another goal or to dream a new dream.", a: "C.S. Lewis" }
];

module.exports = {
  config: {
    name: "inspire",
    aliases: ["quote", "iq"],
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get an inspirational quote" },
    longDescription: { en: "Fetches a random inspirational quote from ZenQuotes API." },
    category: "utility",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://zenquotes.io/api/random", { timeout: 8000 });
      const data = res.data[0];
      return message.reply(`💬 "${data.q}"\n\n— ${data.a}`);
    } catch {
      const q = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      return message.reply(`💬 "${q.q}"\n\n— ${q.a}`);
    }
  }
};
