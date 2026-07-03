const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "admin",
		version: "1.2",
		author: "ashik",
		category: "events"
	},

	onStart: async ({ event, message, usersData }) => {
		try {
			if (event.logMessageType !== "log:thread-admins")
				return;

			const data = event.logMessageData || {};

			const adminEvent = data.admin_event || data.ADMIN_EVENT;
			const targetID = data.target_id || data.TARGET_ID;

			if (!adminEvent || !targetID)
				return;

			let targetName = "Unknown User";
			let authorName = "Admin";

			try {
				targetName = await usersData.getName(targetID);
			} catch {}

			try {
				authorName = await usersData.getName(event.author);
			} catch {}

			let msg = "";
			let imgPath = null;

			if (adminEvent === "add_admin") {
				msg =
`👑 ADMIN PROMOTED

🧑 Name: ${targetName}
🎖️ Status: Promoted To Admin
👤 By: ${authorName}

✨ Congratulations!`;

				imgPath = path.join(__dirname, "cache", "promote.jpeg");
			}

			else if (adminEvent === "remove_admin") {
				msg =
`⚠️ ADMIN DEMOTED

🧑 Name: ${targetName}
📉 Status: Removed From Admin
👤 By: ${authorName}

💔 Admin rights removed.`;

				imgPath = path.join(__dirname, "cache", "demote.jpeg");
			}

			if (!msg)
				return;

			const form = { body: msg };

			if (imgPath && fs.existsSync(imgPath)) {
				form.attachment = fs.createReadStream(imgPath);
			}

			return message.send(form);

		} catch (err) {
			console.log("Admin Event Error:", err);
		}
	}
};
