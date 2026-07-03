const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const getFbPfp = (uid) =>
    `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

module.exports = {
        config: {
                name: "pair8",
                version: "1.0",
                author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
                countDown: 10,
                role: 2,
                shortDescription: "Pair with mentioned user",
                longDescription: "Generate couple image with mentioned user",
                category: "love",
                guide: "{pn} @user"
        },

        onStart: async function ({ api, event, message }) {

                const mentions = Object.keys(event.mentions || {});

                if (!mentions.length)
                        return message.reply(
                                "💞 | Usage:\n/pair8 @user"
                        );

                const targetID = mentions[0];

                if (targetID == event.senderID)
                        return message.reply("❌ | Nijer sathe pair kora jabe na.");

                const outputPath = path.join(
                        __dirname,
                        "cache",
                        `pair8_${event.senderID}_${Date.now()}.png`
                );

                try {

                        api.setMessageReaction("💞", event.messageID, () => {}, true);

                        const threadInfo = await api.getThreadInfo(event.threadID);

                        const me =
                                threadInfo.userInfo.find(
                                        u => u.id == event.senderID
                                ) || {};

                        const partner =
                                threadInfo.userInfo.find(
                                        u => u.id == targetID
                                ) || {};

                        const pfp1 = getFbPfp(event.senderID);
                        const pfp2 = getFbPfp(targetID);
                        const img = await axios.get(
                                `https://api.popcat.xyz/ship?user1=${encodeURIComponent(pfp1)}&user2=${encodeURIComponent(pfp2)}`,
                                { responseType: "arraybuffer" }
                        );

                        fs.writeFileSync(
                                outputPath,
                                Buffer.from(img.data)
                        );

                        const love = Math.floor(
                                Math.random() * 41
                        ) + 60;

                        await message.reply({
                                body:
`╭─❍ 💞 𝐏𝐄𝐑𝐅𝐄𝐂𝐓 𝐏𝐀𝐈𝐑 💞
│
├ 👤 ${me.name || "User"}
├ 💘 ${partner.name || "Partner"}
├ ❤️ Love: ${love}%
│
╰───────────────`,
                                attachment: fs.createReadStream(outputPath)
                        });

                        api.setMessageReaction(
                                "✅",
                                event.messageID,
                                () => {},
                                true
                        );

                        setTimeout(() => {
                                if (fs.existsSync(outputPath))
                                        fs.unlinkSync(outputPath);
                        }, 5000);

                } catch (e) {

                        console.log(e);

                        api.setMessageReaction(
                                "❌",
                                event.messageID,
                                () => {},
                                true
                        );

                        if (fs.existsSync(outputPath))
                                fs.unlinkSync(outputPath);

                        return message.reply(
                                "❌ | Pair image generate failed."
                        );
                }
        }
};
