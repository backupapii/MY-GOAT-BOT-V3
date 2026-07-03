const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => { throw new Error("❌ Image API সাময়িকভাবে বন্ধ আছে। একটু পরে try করুন।"); };
module.exports = {
        config: {
                name: "bed",
                version: "1.7",
                author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
                countDown: 5,
                role: 0,
                description: {
                        bn: "প্রিয়জনের সাথে বেড হাগ ইমেজ জেনারেট করুন",
                        en: "Generate a bed hug image with your loved one",
                        vi: "Tạo hình ảnh ôm nhau trên giường với người yêu"
                },
                category: "love",
                guide: {
                        bn: '   {pn} @মেনশন: কাউকে মেনশন দিয়ে ব্যবহার করুন',
                        en: '   {pn} @mention: Mention someone to use',
                        vi: '   {pn} @mention: Đề cập đến ai đó để sử dụng'
                }
        },

        langs: {
                bn: {
                        noMention: "× বেবি, কাউকে তো মেনশন দাও! 💞",
                        success: "𝐇𝐞𝐫𝐞’𝐬 𝐲𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲 <😘",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noMention: "× Baby, please mention someone! 💞",
                        success: "𝐇𝐞𝐫𝐞’𝐬 𝐲𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲 <😘",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noMention: "× Cưng ơi, hãy đề cập đến ai đó! 💞",
                        success: "Ảnh của cưng đây <😘",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author.trim() !== authorName) {
                        }

                const mentions = Object.keys(event.mentions);
                if (mentions.length === 0) return message.reply(getLang("noMention"));

                const senderID = event.senderID;
                const targetID = mentions[0];
                const imgPath = path.join(__dirname, "cache", `bed_${senderID}_${targetID}.png`);
                if (!fs.existsSync(path.dirname(imgPath))) fs.mkdirSync(path.dirname(imgPath), { recursive: true });

                try {
                     
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        throw new Error("🖼️ Image API সাময়িকভাবে বন্ধ আছে। একটু পরে try করুন।");
                        const response = await axios.post(`https://api.popcat.xyz/bed?user1=${senderID}&user2=${targetID}`, 
                                {}, 
                                { responseType: "arraybuffer" }
                        );

                        fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

                        return message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(imgPath)
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        });

                } catch (err) {
                        console.error("Bed Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
