const { Groq } = require('groq-sdk');

const askGroq = async (text) => {
    if (!process.env.GROQ_API_KEY) return null;
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const res = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: "তুমি SHAKIL BOT, MD SHAKIL HOSSEN এর তৈরি একটি মজাদার বাংলা AI বট। সংক্ষিপ্ত, মজাদার এবং বন্ধুসুলভ উত্তর দাও। বাংলায় উত্তর দাও।" },
                { role: "user", content: text }
            ],
            max_tokens: 400,
            temperature: 0.9
        });
        return res.choices[0]?.message?.content?.trim() || null;
    } catch(e) {
        return null;
    }
};

const triggerWords = ["bot"];

module.exports = {
    config: {
        name: "bot",
        aliases: ["Bot", "বট"],
        version: "12.0",
        author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
        countDown: 0,
        role: 0,
        description: "Bot responds to 'bot' trigger with AI or funny dialogues",
        category: "fun",
        guide: { en: "{pn} [text]" }
    },

    onStart: async function ({ api, event, args, usersData, commandName }) {
        const { threadID, messageID, senderID } = event;
        try {
            const name = await usersData.getName(senderID);
            if (!args[0]) {
                return api.sendMessage({
                    body: `𓆩» ${name} «𓆪\nবলুন আমি "বট" আপনাকে কিভাবে সাহায্য করতে পারি? 😘`,
                    mentions: [{ tag: name, id: senderID }]
                }, threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                }, messageID);
            }
            const reply = await askGroq(args.join(" "));
            return api.sendMessage(reply || "AI এখন একটু busy! পরে try করুন 😅", threadID, (err, info) => {
                if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
            }, messageID);
        } catch (err) {
            return api.sendMessage("❌ Error: " + err.message, threadID, messageID);
        }
    },

    onReply: async function ({ api, event, commandName }) {
        if (api.getCurrentUserID() == event.senderID) return;
        try {
            const reply = await askGroq(event.body || "hi");
            if (!reply) return;
            return api.sendMessage(reply, event.threadID, (err, info) => {
                if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: event.senderID });
            }, event.messageID);
        } catch {}
    },

    onChat: async function ({ api, event, usersData, commandName }) {
        const { body, senderID, threadID, messageID } = event;
        if (!body) return;

        const lowerBody = body.toLowerCase();

        if (triggerWords.some(word => lowerBody.startsWith(word))) {
            const text = body.replace(/^bot\s*/i, "").trim();

            if (!text) {
                const name = await usersData.getName(senderID).catch(() => "জান");

                const randomReplies = [
          "কি খবর জান 😼",
          "বার বার ডাকিস কেন 😒",
          "বল কি লাগবে 🐸",
          "আমি বস 𝗦𝗛𝗔𝗞𝗜𝗟 এর সাথে বিজি 😎",
          "কি করতেছো সবাই 👀",
          "আমাকে ডাকলে কিস করে দিবো কিন্তু 😘","🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻","আমি এখন বস ‌「 ✦ 𝗦𝗛𝗔𝗞𝗜𝗟 ✦ 」এর সাথে বিজি আছি আমাকে ডাকবেন না-😕😏 ধন্যবাদ-🤝🌻","আমাকে না ডেকে আমার বস 𝐒𝐇𝐀𝐊𝐈𝐋 কে একটা জি এফ দাও-😽🫶🌺","ঝাং থুমালে আইলাপিউ পেপি-💝😽","উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈","জান তোমার নানি'রে আমার হাতে তুলে দিবা-🙊🙆‍♂","আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না-😪🤧","ঝাং 🫵থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦","চুনা ও চুনা আমার বস ‌「 ✦ 𝗦𝗛𝗔𝗞𝗜𝗟 ✦ 」 এর হবু বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭","স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻","জান হাঙ্গা করবা-🙊😝🌻","জান মেয়ে হলে চিপায় আসো ইউটিউব থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽","ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼","আমার বস 𓆩‌🙂‌—͞𝐒𝐇𝐀𝐊𝐈𝐋𓆪❤️‍🩹 এর পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶 আমার বস 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 এর  জন্য দোয়া করবেন-💝💚🌺🌻","ভালোবাসা নামক আব্লামি করতে মন চাইলে আমার বস 𓆩𝗦𝗵𝗮𝗸𝗶𝗹𓆪 এর ইনবক্স চলে যাও-🙊🥱👅","জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽","Bot না , জানু বল জানু 😘","বার বার Disturb করেছিস কোনো😾","হা বলো😒,কি করতে পারি😐😑?","এতো ডাকছিস কোনো?গালি শুনবি নাকি? 🤬","বেশি Bot Bot করলে leave নিবো কিন্তু😒😒","শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নি🥺 পচা তুমি🥺","আমি আবাল দের সাতে কথা বলি না,ok😒","এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈","Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈💋","বার বার ডাকলে মাথা গরম হয় কিন্তু😑","হা বলো😒,কি করতে পারি😐😑?","আমি গরীব এর সাথে কথা বলি না😼😼","হা জানু , এইদিক এ আসো কিস দেই🤭 😘","দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣","তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂","আমাকে ডেকো না,আমি ব্যাস্ত আসি","কি হলো ,মিস টিস করচ্ছিস নাকি🤣","হা বলো, শুনছি আমি 😏","আর কত বার ডাকবি ,শুনছি তো","বলো কি করতে পারি তোমার জন্য","আমি তো অন্ধ কিছু দেখি না🐸 😎","Bot না জানু,বল 😌","তোর কি চোখে পড়ে না আমি বস ‌「 ✦ 𝗦𝗛𝗔𝗞𝗜𝗟 ✦ 」 এর সাথে ব্যাস্ত আসি😒"
                ];

                const rand = randomReplies[Math.floor(Math.random() * randomReplies.length)];

                return api.sendMessage({
                    body: `𓆩» ${name} «𓆪\n\n${rand}`,
                    mentions: [{ tag: name, id: senderID }]
                }, threadID, messageID);
            }

            try {
                const reply = await askGroq(text);
                if (reply) {
                    api.sendMessage(reply, threadID, (err, info) => {
                        if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                    }, messageID);
                }
            } catch {}
        }
    }
};
