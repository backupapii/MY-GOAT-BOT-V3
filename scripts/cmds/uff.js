module.exports = {
  config: {
    name: "uff",
    aliases: ["ish", "sigh", "irritate"],
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Express frustration at someone 😤" },
    longDescription: { en: "Fun command to express frustration — mention someone or reply to their message" },
    category: "fun",
    guide: { en: "{pn} @mention — tag someone\n{pn} [reply]   — reply to message" }
  },

  onStart: async function ({ message, event, usersData }) {
    const { senderID, mentions, type, messageReply } = event;

    const MSGS = [
      "উফ! তুমি আবার এলে? 😒",
      "ইশ! বিরক্ত করো না তো! 😤",
      "আরেহ! কী চাও তুমি? 🤦",
      "উফ! যাও এখান থেকে! 😠",
      "ইশ! তোমার কথা আর শুনতে চাই না! 😑",
      "উফফ! মাথা নষ্ট হয়ে যাচ্ছে! 🤯",
      "আরে বাবা! থামো একটু! 😫",
      "ইশশ! এত বিরক্তিকর কেন তুমি! 😖"
    ];

    let targetID = senderID;
    if (type === "message_reply" && messageReply?.senderID) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions || {}).length > 0) {
      targetID = Object.keys(mentions)[0];
    }

    const senderName = await usersData.getName(senderID).catch(() => "Someone");
    const targetName = targetID === senderID
      ? "নিজেকে"
      : await usersData.getName(targetID).catch(() => "তোমাকে");

    const msg = MSGS[Math.floor(Math.random() * MSGS.length)];

    return message.reply(
      `😤 ${senderName} says:\n\n` +
      `উফ! ${targetName}!\n${msg}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🤖 SHAKIL BOT V3`
    );
  }
};
