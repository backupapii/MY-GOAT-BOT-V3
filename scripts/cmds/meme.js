const axios = require("axios");

module.exports = {
    config: {
        name: "meme",
        aliases: ["memes"],
        version: "2.0",
        author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
        countDown: 10,
        role: 0,
        category: "fun",
        guide: { en: "{pn}" }
    },

    onStart: async function ({ message, event, api }) {
        try {
            const res = await axios.get("https://meme-api.com/gimme", { timeout: 10000 });
            const { url, title, subreddit } = res.data || {};

            if (!url) return message.reply("❌ Meme আনতে পারিনি। আবার try করুন।");

            const stream = await axios({ method: "GET", url, responseType: "stream", timeout: 15000 });

            await api.sendMessage({
                body: `🐸 | ${title || "Random Meme"}\n📌 r/${subreddit || "memes"}`,
                attachment: stream.data
            }, event.threadID, event.messageID);
        } catch (err) {
            return message.reply("❌ Meme আনতে সমস্যা হয়েছে। একটু পরে try করুন।");
        }
    }
};
