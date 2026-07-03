module.exports = {
	config: {
		name: "adminbot",
		version: "1.0",
		author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
		countDown: 5,
		role: 0,
		shortDescription: "Show bot admins",
		longDescription: "Show all bot admin names and IDs",
		category: "info",
		guide: "{pn}"
	},

	onStart: async function ({ api, message, globalData }) {
		try {
			const adminIDs = global.GoatBot.config.adminBot.filter(id => id && id.trim());

			if (!adminIDs.length)
				return message.reply("❌ | No bot admin found.");

			let msg = "╭──── 👑 BOT ADMINS 👑 ────╮\n\n";

			for (let i = 0; i < adminIDs.length; i++) {
				try {
					const info = await api.getUserInfo(adminIDs[i]);
					const name = info[adminIDs[i]]?.name || "Unknown";

					msg += `${i + 1}. ${name}\n`;
					msg += `🆔 ${adminIDs[i]}\n\n`;
				}
				catch {
					msg += `${i + 1}. Unknown User\n`;
					msg += `🆔 ${adminIDs[i]}\n\n`;
				}
			}

			msg += `╰───────────────╯`;

			return message.reply(msg);

		} catch (e) {
			console.log(e);
			return message.reply("❌ | Failed to get admin list.");
		}
	}
};
