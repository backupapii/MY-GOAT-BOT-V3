const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
        config: {
                name: "adminadd",
                alias: ["operator"],
                version: "3.0",
                author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
                countDown: 5,
                role: 0,
                shortDescription: { en: "Operator system" },
                longDescription: { en: "Add/remove operator (only owner), list operator (everyone)" },
                category: "box chat",
                guide: {
                        en: " {pn} add @tag\n {pn} remove @tag\n {pn} list"
                }
        },

        langs: {
                en: {
                        added: "✅ Added %1 operator(s):\n%2",
                        alreadyAdmin: "\n⚠️ Already operator:\n%1",
                        missingIdAdd: "⚠️ Mention, reply, or give UID to add operator.",
                        removed: "✅ Removed %1 operator(s):\n%2",
                        notAdmin: "⚠️ Not an operator:\n%1",
                        missingIdRemove: "⚠️ Mention, reply, or give UID to remove operator."
                }
        },

        onStart: async function ({ message, args, usersData, event, getLang }) {

                const senderID = event.senderID;
                const OWNER = ["61593629243000"];
                const isOwner = OWNER.includes(senderID);

                switch (args[0]) {

                        case "add":
                        case "-a": {
                                if (!isOwner)
                                        return message.reply(
`👿━━━━━━━━━━━━━━━━━━👿
  ❌ 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗 😈
👿━━━━━━━━━━━━━━━━━━👿
Only 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
can add operators.`);

                                let uids = [];
                                if (event.type === "message_reply") {
                                        uids.push(event.messageReply.senderID);
                                } else if (Object.keys(event.mentions).length > 0) {
                                        uids = Object.keys(event.mentions);
                                } else if (args.slice(1).length > 0) {
                                        uids = args.slice(1).filter(arg => !isNaN(arg));
                                }

                                if (uids.length === 0)
                                        return message.reply(getLang("missingIdAdd"));

                                const notAdminIds = [], adminIds = [];
                                for (const uid of uids) {
                                        if (config.adminBot.includes(uid)) adminIds.push(uid);
                                        else notAdminIds.push(uid);
                                }
                                config.adminBot.push(...notAdminIds);

                                const getNames = await Promise.all(
                                        uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
                                );
                                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                                return message.reply(
                                        (notAdminIds.length > 0 ? getLang("added", notAdminIds.length,
                                                getNames.filter(n => notAdminIds.includes(n.uid)).map(i => `  • ${i.name} (${i.uid})`).join("\n")
                                        ) : "") +
                                        (adminIds.length > 0 ? getLang("alreadyAdmin",
                                                adminIds.map(uid => `  • ${uid}`).join("\n")
                                        ) : "")
                                );
                        }

                        case "remove":
                        case "-r": {
                                if (!isOwner)
                                        return message.reply(
`👿━━━━━━━━━━━━━━━━━━👿
  ❌ 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗 😈
👿━━━━━━━━━━━━━━━━━━👿
Only 𝗠𝗗 𝗦𝗛𝗔𝗞𝗜𝗟 𝗛𝗢𝗦𝗦𝗘𝗡
can remove operators.`);

                                let uids = [];
                                if (event.type === "message_reply") {
                                        uids.push(event.messageReply.senderID);
                                } else if (Object.keys(event.mentions).length > 0) {
                                        uids = Object.keys(event.mentions);
                                } else if (args.slice(1).length > 0) {
                                        uids = args.slice(1).filter(arg => !isNaN(arg));
                                }

                                if (uids.length === 0)
                                        return message.reply(getLang("missingIdRemove"));

                                const notAdminIds = [], adminIds = [];
                                for (const uid of 
uids) {
                                        if (!config.adminBot.includes(uid)) notAdminIds.push(uid);
                                        else adminIds.push(uid);
                                }
                                config.adminBot = config.adminBot.filter(id => !adminIds.includes(id));

                                const getNames = await Promise.all(
                                        uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
                                );
                                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                                return message.reply(
                                        (adminIds.length > 0 ? getLang("removed", adminIds.length,
                                                getNames.filter(n => adminIds.includes(n.uid)).map(i => `  • ${i.name} (${i.uid})`).join("\n")
                                        ) : "") +
                                        (notAdminIds.length > 0 ? getLang("notAdmin",
                                                notAdminIds.map(uid => `  • ${uid}`).join("\n")
                                        ) : "")
                                );
                        }

                        default:
                                return message.reply(
`📋 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥 𝗦𝗬𝗦𝗧𝗘𝗠
━━━━━━━━━━━━━━━━━━
{pn} add @mention — add operator
{pn} remove @mention — remove operator
{pn} list — view all operators`
                                );
                }
        }
};
