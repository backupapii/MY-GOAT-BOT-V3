const { Groq } = require('groq-sdk');
const fs = require('fs-extra');
const path = require('path');

const TEACH_FILE = path.join(__dirname, '../../database/babyTeach.json');

const getTeaches = () => {
    try { return fs.existsSync(TEACH_FILE) ? JSON.parse(fs.readFileSync(TEACH_FILE, 'utf8')) : {}; }
    catch { return {}; }
};

const saveTeaches = (data) => {
    fs.ensureDirSync(path.dirname(TEACH_FILE));
    fs.writeFileSync(TEACH_FILE, JSON.stringify(data, null, 2));
};

const askGroq = async (text) => {
    if (!process.env.GROQ_API_KEY) return null;
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const res = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: "তুমি SHAKIL এর Baby Bot। তুমি বাংলায় মিষ্টি, ভালোবাসাময় এবং মজাদার উত্তর দাও। সংক্ষিপ্ত থাকো।" },
                { role: "user", content: text }
            ],
            max_tokens: 300,
            temperature: 0.9
        });
        return res.choices[0]?.message?.content?.trim() || null;
    } catch { return null; }
};

const findTeachMatch = (text) => {
    const teaches = getTeaches();
    const lowerText = text.toLowerCase();
    for (const key of Object.keys(teaches)) {
        if (lowerText.includes(key.toLowerCase())) return teaches[key];
    }
    return null;
};

const triggerWords = ["বট", "bot", "shakil", "bby", "শাকিল", "bbu", "jan", "sona", "জান", "জানু", "বেবি", "janu", "bbz"];

const randomReplies = [
    "কি খবর জান 😼", "বার বার ডাকিস কেন 😒", "বল কি লাগবে 🐸",
    "আমি বস 𝗦𝗛𝗔𝗞𝗜𝗟 এর সাথে বিজি 😎", "কি করতেছো সবাই 👀",
    "আমাকে ডাকলে কিস করে দিবো কিন্তু 😘",
    "Bot না , জানু বল জানু 😘", "বার বার Disturb করেছিস কোনো 😾",
    "হা বলো 😒, কি করতে পারি 😐😑?", "এতো ডাকছিস কোনো? গালি শুনবি নাকি? 🤬",
    "আমি এখন বস ‌「 ✦ 𝗦𝗛𝗔𝗞𝗜𝗟 ✦ 」এর সাথে বিজি আছি 😕",
    "উফফ বুঝলাম না এতো ডাকছেন কেনো 😤",
    "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈💋",
    "বেশি bot bot করলে leave নিবো কিন্তু 😒",
    "Bot না জানু, বল 😌", "হা জানু , এইদিক এ আসো কিস দেই 🤭 😘",
    "আমি গরীব এর সাথে কথা বলি না 😼",
    "এত কাছেও এসো না, প্রেম এ পরে যাবো তো 🙈",
    "দূরে যা, তোর কোনো কাজ নাই 😉", "কি হলো, মিস টিস করছিস নাকি 🤣",
    "হা বলো, শুনছি আমি 😏", "বলো কি করতে পারি তোমার জন্য 😊"
];

module.exports = {
    config: {
        name: "baby",
        aliases: ["bby", "bbu", "jan", "janu", "bbz", "শাকিল"],
        version: "3.0",
        author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
        countDown: 2,
        role: 0,
        shortDescription: { en: "Advanced AI Chat Bot" },
        longDescription: { en: "Chat with Shakil AI and teach it new things" },
        category: "chat",
        guide: {
            en: "{pn} hi\n{pn} teach question - answer\n{pn} edit question - new answer\n{pn} remove question\n{pn} list"
        }
    },

    langs: {
        en: {
            noInput: "🥺 | Bolo baby...",
            teachUsage: "❌ | Usage:\nbaby teach question - answer",
            teachSuccess: "✅ শিখে গেছি!\n📝 প্রশ্ন: %1\n💬 উত্তর: %2\n👤 শিক্ষক: %3\n📚 মোট: %4",
            editUsage: "❌ | Usage:\nbaby edit question - new answer",
            editSuccess: "✅ উত্তর আপডেট হয়েছে!\n📝 প্রশ্ন: %1\n💬 নতুন উত্তর: %2",
            removeUsage: "❌ | Usage:\nbaby remove question",
            error: "❌ Error: %1"
        }
    },

    onStart: async function ({ api, event, args, usersData, getLang, commandName }) {
        const { threadID, messageID, senderID } = event;
        try {
            if (!args[0]) {
                return api.sendMessage(getLang("noInput"), threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                }, messageID);
            }

            const action = args[0].toLowerCase();
            const teaches = getTeaches();

            if (action === "teach") {
                const input = args.slice(1).join(" ");
                const parts = input.split(" - ");
                if (parts.length < 2) return api.sendMessage(getLang("teachUsage"), threadID, messageID);
                const trigger = parts[0].trim().toLowerCase();
                const response = parts.slice(1).join(" - ").trim();
                teaches[trigger] = response;
                saveTeaches(teaches);
                const name = await usersData.getName(senderID).catch(() => "User");
                return api.sendMessage(getLang("teachSuccess", parts[0].trim(), response, name, Object.keys(teaches).length), threadID, messageID);
            }

            if (action === "edit") {
                const input = args.slice(1).join(" ");
                const parts = input.split(" - ");
                if (parts.length < 2) return api.sendMessage(getLang("editUsage"), threadID, messageID);
                const trigger = parts[0].trim().toLowerCase();
                const newResp = parts.slice(1).join(" - ").trim();
                if (!teaches[trigger]) return api.sendMessage(`❌ "${parts[0].trim()}" পাওয়া যায়নি।`, threadID, messageID);
                teaches[trigger] = newResp;
                saveTeaches(teaches);
                return api.sendMessage(getLang("editSuccess", parts[0].trim(), newResp), threadID, messageID);
            }

            if (action === "remove") {
                const trigger = args.slice(1).join(" ").trim().toLowerCase();
                if (!trigger) return api.sendMessage(getLang("removeUsage"), threadID, messageID);
                if (!teaches[trigger]) return api.sendMessage(`❌ "${args.slice(1).join(" ").trim()}" পাওয়া যায়নি।`, threadID, messageID);
                delete teaches[trigger];
                saveTeaches(teaches);
                return api.sendMessage(`✅ "${args.slice(1).join(" ").trim()}" মুছে ফেলা হয়েছে।`, threadID, messageID);
            }

            if (action === "list") {
                const keys = Object.keys(teaches);
                if (!keys.length) return api.sendMessage("📚 এখনো কিছু শেখানো হয়নি। ব্যবহার করুন: baby teach Q - A", threadID, messageID);
                const list = keys.slice(0, 30).map((k, i) => `${i+1}. ${k}`).join("\n");
                return api.sendMessage(`📚 শেখানো প্রশ্ন (${keys.length} টি):\n\n${list}`, threadID, messageID);
            }

            const question = args.join(" ");
            const taught = findTeachMatch(question);
            if (taught) {
                return api.sendMessage(taught, threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                }, messageID);
            }

            const reply = await askGroq(question);
            return api.sendMessage(reply || "😔 AI এখন busy! একটু পরে try করুন।", threadID, (err, info) => {
                if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
            }, messageID);

        } catch (err) {
            return api.sendMessage(getLang("error", err.message), threadID, messageID);
        }
    },

    onReply: async function ({ api, event, commandName }) {
        try {
            const text = event.body?.trim();
            if (!text) return;
            const taught = findTeachMatch(text);
            if (taught) {
                return api.sendMessage(taught, event.threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: event.senderID });
                }, event.messageID);
            }
            const reply = await askGroq(text);
            if (!reply) return;
            return api.sendMessage(reply, event.threadID, (err, info) => {
                if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: event.senderID });
            }, event.messageID);
        } catch {}
    },

    onChat: async function ({ api, event, commandName }) {
        try {
            if (!event.body) return;
            if (event.type === "message_reply") return;
            const msgLower = event.body.toLowerCase();
            if (!triggerWords.some(word => msgLower.startsWith(word))) return;

            api.setMessageReaction("🪽", event.messageID, () => {}, true);

            const text = event.body.replace(/^(বট|bot|shakil|baby|bby|শাকিল|bbu|jan|sona|জান|জানু|বেবি|janu|bbz)\s*/i, "").trim();

            if (text) {
                const taught = findTeachMatch(text);
                if (taught) {
                    return api.sendMessage(taught, event.threadID, (err, info) => {
                        if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: event.senderID });
                    }, event.messageID);
                }
                const reply = await askGroq(text);
                if (reply) {
                    return api.sendMessage(reply, event.threadID, (err, info) => {
                        if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: event.senderID });
                    }, event.messageID);
                }
            }

            const rand = randomReplies[Math.floor(Math.random() * randomReplies.length)];
            return api.sendMessage(rand, event.threadID, event.messageID);
        } catch {}
    }
};
