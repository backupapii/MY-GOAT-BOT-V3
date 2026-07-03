module.exports = {
  config: {
    name: "flip",
    aliases: ["coin", "dice", "roll"],
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Flip a coin or roll a dice" },
    longDescription: { en: "Flip a coin (heads/tails) or roll a dice. Use 'flip dice' or 'flip coin'." },
    category: "fun",
    guide: { en: "{pn} [coin|dice|Nd|N] — e.g. {pn} coin | {pn} dice | {pn} 2d6" }
  },

  onStart: async function ({ message, args }) {
    const input = (args[0] || "coin").toLowerCase();

    if (input === "dice" || input === "d6") {
      const result = Math.floor(Math.random() * 6) + 1;
      const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      return message.reply(`🎲 Dice Roll: ${faces[result - 1]} ${result}`);
    }

    if (/^\d+d\d+$/.test(input)) {
      const [count, sides] = input.split("d").map(Number);
      if (count > 20 || sides > 100) return message.reply("❌ Max: 20d100");
      const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
      const total = rolls.reduce((a, b) => a + b, 0);
      return message.reply(`🎲 ${count}d${sides}: [${rolls.join(", ")}] = ${total}`);
    }

    const result = Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails";
    return message.reply(`🪙 Coin Flip: **${result}**`);
  }
};
