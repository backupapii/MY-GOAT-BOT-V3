const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "setting",
		aliases: ["settings", "config"],
		version: "1.1.0",
		author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
		countDown: 5,
		role: 2,
		shortDescription: { en: "Bot settings manager" },
		longDescription: { en: "Control all bot settings via interactive chat menu" },
		category: "admin",
		guide: { en: "{pn}" }
	},

	onStart: async function ({ api, event, message }) {
		const mainMenu = [
			"⚙️ 𝗦𝗛𝗔𝗞𝗜𝗟 𝗕𝗢𝗧 𝗦𝗲𝘁𝘁𝗶𝗻𝗴𝘀",
			"━━━━━━━━━━━━━━━━━",
			"1️⃣  Bot Config",
			"2️⃣  Admin Manage",
			"3️⃣  Whitelist Manage",
			"4️⃣  No Prefix",
			"5️⃣  React Unsend",
			"6️⃣  Nickname",
			"7️⃣  FCA Options",
			"━━━━━━━━━━━━━━━━━",
			"› Reply 1–7 to select"
		].join("\n");

		const sent = await message.reply(mainMenu);
		global.GoatBot.onReply.set(sent.messageID, {
			commandName: "setting",
			messageID: sent.messageID,
			author: event.senderID,
			state: "main"
		});
	},

	onReply: async function ({ api, event, Reply, message }) {
		const { author, state } = Reply;
		if (event.senderID !== author) return;

		const configPath = path.join(process.cwd(), "config.json");
		let config;
		try {
			config = JSON.parse(fs.readFileSync(configPath, "utf8"));
		} catch (e) {
			return message.reply("❌ Failed to read config.json: " + e.message);
		}

		const input = (event.body || "").trim();
		const num = parseInt(input);

		function saveConfig() {
			fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
			// Hot-reload global config
			try { global.GoatBot.config = config; } catch (e) {}
		}

		function status(val) {
			return val ? "✅ ON" : "❌ OFF";
		}

		async function sendAndListen(text, newState, extra = {}) {
			const sent = await message.reply(text);
			global.GoatBot.onReply.set(sent.messageID, {
				commandName: "setting",
				messageID: sent.messageID,
				author,
				state: newState,
				...extra
			});
		}

		// ─── MAIN MENU ───
		if (state === "main") {
			if (num === 1) {
				return await sendAndListen([
					"⚙️ Bot Config",
					"━━━━━━━━━━━━━━━━━",
					`1. Admin Only — ${status(config.adminOnly?.enable)}`,
					`2. Anti Inbox — ${status(config.antiInbox)}`,
					`3. Auto Restart — ${config.autoRestart?.time || "OFF"}`,
					"━━━━━━━━━━━━━━━━━",
					"› Reply 1–3 to toggle"
				].join("\n"), "botConfig");
			}
			if (num === 2) {
				return await sendAndListen([
					"⚙️ Admin Manage",
					"━━━━━━━━━━━━━━━━━",
					"1. Add Admin",
					"2. Remove Admin",
					"3. List Admins",
					"━━━━━━━━━━━━━━━━━",
					"› Reply 1–3"
				].join("\n"), "adminManage");
			}
			if (num === 3) {
				return await sendAndListen([
					"⚙️ Whitelist Manage",
					"━━━━━━━━━━━━━━━━━",
					`1. Thread Whitelist — ${status(config.whiteListModeThread?.enable)}`,
					"2. Add Thread ID",
					"3. Remove Thread ID",
					`4. User Whitelist — ${status(config.whiteListMode?.enable)}`,
					"5. Add User ID",
					"6. Remove User ID",
					"━━━━━━━━━━━━━━━━━",
					"› Reply 1–6"
				].join("\n"), "whitelist");
			}
			if (num === 4) {
				config.noPrefix = config.noPrefix || {};
				config.noPrefix.enable = !config.noPrefix.enable;
				saveConfig();
				return message.reply(`✦ No Prefix — ${status(config.noPrefix.enable)}`);
			}
			if (num === 5) {
				return await sendAndListen([
					"⚙️ React Unsend",
					"━━━━━━━━━━━━━━━━━",
					`1. Toggle — ${status(config.reactUnsend?.enable)}`,
					`2. Only Admin — ${status(config.reactUnsend?.onlyAdmin)}`,
					"3. Add Emoji",
					"4. Remove Emoji",
					"5. List Emojis",
					"━━━━━━━━━━━━━━━━━",
					"› Reply 1–5"
				].join("\n"), "reactUnsend");
			}
			if (num === 6) {
				return await sendAndListen([
					"⚙️ Nickname",
					"━━━━━━━━━━━━━━━━━",
					`› Current: ${config.nickNameBot || "Not set"}`,
					"━━━━━━━━━━━━━━━━━",
					"1. Set (this group)",
					"2. Set (all groups)",
					"3. Reset",
					"━━━━━━━━━━━━━━━━━",
					"› Reply 1–3"
				].join("\n"), "nickname");
			}
			if (num === 7) {
				const o = config.optionsFca || {};
				return await sendAndListen([
					"⚙️ FCA Options",
					"━━━━━━━━━━━━━━━━━",
					`1. Force Login — ${status(o.forceLogin)}`,
					`2. Listen Events — ${status(o.listenEvents)}`,
					`3. Update Presence — ${status(o.updatePresence)}`,
					`4. Listen Typing — ${status(o.listenTyping)}`,
					`5. Self Listen — ${status(o.selfListen)}`,
					`6. Self Listen Event — ${status(o.selfListenEvent)}`,
					`7. Auto Mark Delivery — ${status(o.autoMarkDelivery)}`,
					`8. Auto Reconnect — ${status(o.autoReconnect)}`,
					"━━━━━━━━━━━━━━━━━",
					"› Reply 1–8 to toggle"
				].join("\n"), "fcaOptions");
			}
		}

		// ─── BOT CONFIG ───
		if (state === "botConfig") {
			if (num === 1) {
				config.adminOnly = config.adminOnly || {};
				config.adminOnly.enable = !config.adminOnly.enable;
				saveConfig();
				return message.reply(`✦ Admin Only — ${status(config.adminOnly.enable)}`);
			}
			if (num === 2) {
				config.antiInbox = !config.antiInbox;
				saveConfig();
				return message.reply(`✦ Anti Inbox — ${status(config.antiInbox)}`);
			}
			if (num === 3) {
				config.autoRestart = config.autoRestart || {};
				config.autoRestart.time = config.autoRestart.time ? null : 3600000;
				saveConfig();
				return message.reply(`✦ Auto Restart — ${config.autoRestart.time ? "ON (1hr)" : "OFF"}`);
			}
		}

		// ─── ADMIN MANAGE ───
		if (state === "adminManage") {
			if (num === 1) return await sendAndListen("› Reply with UID or @tag user to add as admin:", "adminAdd");
			if (num === 2) {
				const admins = config.adminBot || [];
				if (!admins.length) return message.reply("𝗫 No admins found.");
				return await sendAndListen(`Select admin to remove:\n━━━━━━━━━━━━━━━━━\n${admins.map((id, i) => `${i + 1}. ${id}`).join("\n")}\n━━━━━━━━━━━━━━━━━\n› Reply number`, "adminRemoveSelect");
			}
			if (num === 3) {
				const admins = config.adminBot || [];
				if (!admins.length) return message.reply("𝗫 No admins.");
				return message.reply(`⚙️ Admins:\n━━━━━━━━━━━━━━━━━\n${admins.map((id, i) => `${i + 1}. ${id}`).join("\n")}`);
			}
		}
		if (state === "adminAdd") {
			let uid = input;
			if (event.mentions && Object.keys(event.mentions).length > 0) uid = Object.keys(event.mentions)[0];
			if (!uid || isNaN(uid)) return message.reply("𝗫 Invalid UID.");
			config.adminBot = config.adminBot || [];
			if (config.adminBot.includes(uid)) return message.reply("𝗫 Already an admin.");
			config.adminBot.push(uid);
			saveConfig();
			return message.reply(`✦ Added ${uid} as admin.`);
		}
		if (state === "adminRemoveSelect") {
			const admins = config.adminBot || [];
			const idx = num - 1;
			if (isNaN(num) || !admins[idx]) return message.reply("𝗫 Invalid.");
			const removed = admins.splice(idx, 1)[0];
			config.adminBot = admins;
			saveConfig();
			return message.reply(`✦ Removed admin: ${removed}`);
		}

		// ─── WHITELIST ───
		if (state === "whitelist") {
			if (num === 1) {
				config.whiteListModeThread = config.whiteListModeThread || {};
				config.whiteListModeThread.enable = !config.whiteListModeThread.enable;
				saveConfig();
				return message.reply(`✦ Thread Whitelist — ${status(config.whiteListModeThread.enable)}`);
			}
			if (num === 2) return await sendAndListen("› Reply with Thread ID to whitelist:", "threadAdd");
			if (num === 3) {
				const threads = config.whiteListModeThread?.whiteListThreadIds || [];
				if (!threads.length) return message.reply("𝗫 No threads.");
				return await sendAndListen(`Select to remove:\n${threads.map((id, i) => `${i + 1}. ${id}`).join("\n")}\n› Reply number`, "threadRemoveSelect");
			}
			if (num === 4) {
				config.whiteListMode = config.whiteListMode || {};
				config.whiteListMode.enable = !config.whiteListMode.enable;
				saveConfig();
				return message.reply(`✦ User Whitelist — ${status(config.whiteListMode.enable)}`);
			}
			if (num === 5) return await sendAndListen("› Reply with UID or @tag to whitelist:", "userAdd");
			if (num === 6) {
				const users = config.whiteListMode?.whiteListIds || [];
				if (!users.length) return message.reply("𝗫 No users.");
				return await sendAndListen(`Select to remove:\n${users.map((id, i) => `${i + 1}. ${id}`).join("\n")}\n› Reply number`, "userRemoveSelect");
			}
		}
		if (state === "threadAdd") {
			if (!input || isNaN(input)) return message.reply("𝗫 Invalid Thread ID.");
			config.whiteListModeThread = config.whiteListModeThread || { whiteListThreadIds: [] };
			config.whiteListModeThread.whiteListThreadIds = config.whiteListModeThread.whiteListThreadIds || [];
			if (config.whiteListModeThread.whiteListThreadIds.includes(input)) return message.reply("𝗫 Already added.");
			config.whiteListModeThread.whiteListThreadIds.push(input);
			saveConfig();
			return message.reply(`✦ Thread ${input} added.`);
		}
		if (state === "threadRemoveSelect") {
			const threads = config.whiteListModeThread?.whiteListThreadIds || [];
			const idx = num - 1;
			if (isNaN(num) || !threads[idx]) return message.reply("𝗫 Invalid.");
			const removed = threads.splice(idx, 1)[0];
			saveConfig();
			return message.reply(`✦ Thread ${removed} removed.`);
		}
		if (state === "userAdd") {
			let uid = input;
			if (event.mentions && Object.keys(event.mentions).length > 0) uid = Object.keys(event.mentions)[0];
			if (!uid || isNaN(uid)) return message.reply("𝗫 Invalid UID.");
			config.whiteListMode = config.whiteListMode || { whiteListIds: [] };
			config.whiteListMode.whiteListIds = config.whiteListMode.whiteListIds || [];
			if (config.whiteListMode.whiteListIds.includes(uid)) return message.reply("𝗫 Already added.");
			config.whiteListMode.whiteListIds.push(uid);
			saveConfig();
			return message.reply(`✦ User ${uid} added.`);
		}
		if (state === "userRemoveSelect") {
			const users = config.whiteListMode?.whiteListIds || [];
			const idx = num - 1;
			if (isNaN(num) || !users[idx]) return message.reply("𝗫 Invalid.");
			const removed = users.splice(idx, 1)[0];
			saveConfig();
			return message.reply(`✦ User ${removed} removed.`);
		}

		// ─── REACT UNSEND ───
		if (state === "reactUnsend") {
			config.reactUnsend = config.reactUnsend || {};
			if (num === 1) {
				config.reactUnsend.enable = !config.reactUnsend.enable;
				saveConfig();
				return message.reply(`✦ React Unsend — ${status(config.reactUnsend.enable)}`);
			}
			if (num === 2) {
				config.reactUnsend.onlyAdmin = !config.reactUnsend.onlyAdmin;
				saveConfig();
				return message.reply(`✦ Only Admin — ${status(config.reactUnsend.onlyAdmin)}`);
			}
			if (num === 3) return await sendAndListen("› Reply with emoji to add:", "emojiAdd");
			if (num === 4) {
				const emojis = config.reactUnsend?.emojis || [];
				if (!emojis.length) return message.reply("𝗫 No emojis.");
				return await sendAndListen(`Select to remove:\n${emojis.map((e, i) => `${i + 1}. ${e}`).join("\n")}\n› Reply number`, "emojiRemoveSelect");
			}
			if (num === 5) {
				const emojis = config.reactUnsend?.emojis || [];
				return message.reply(emojis.length ? `⚙️ Emojis: ${emojis.join("  ")}` : "𝗫 No emojis set.");
			}
		}
		if (state === "emojiAdd") {
			const emoji = input;
			if (!emoji) return message.reply("𝗫 No emoji.");
			config.reactUnsend = config.reactUnsend || {};
			config.reactUnsend.emojis = config.reactUnsend.emojis || [];
			if (config.reactUnsend.emojis.includes(emoji)) return message.reply("𝗫 Already added.");
			config.reactUnsend.emojis.push(emoji);
			saveConfig();
			return message.reply(`✦ Emoji ${emoji} added.`);
		}
		if (state === "emojiRemoveSelect") {
			const emojis = config.reactUnsend?.emojis || [];
			const idx = num - 1;
			if (isNaN(num) || !emojis[idx]) return message.reply("𝗫 Invalid.");
			const removed = emojis.splice(idx, 1)[0];
			saveConfig();
			return message.reply(`✦ Emoji ${removed} removed.`);
		}

		// ─── NICKNAME ───
		if (state === "nickname") {
			if (num === 1) return await sendAndListen("› Reply with new nickname:", "nicknameSet");
			if (num === 2) return await sendAndListen("› Reply with new nickname (sets in ALL groups):", "nicknameSetAll");
			if (num === 3) {
				config.nickNameBot = "";
				saveConfig();
				try { await api.changeNickname("", event.threadID, api.getCurrentUserID()); } catch (e) {}
				return message.reply("✦ Nickname reset.");
			}
		}
		if (state === "nicknameSet") {
			if (!input) return message.reply("𝗫 Invalid.");
			config.nickNameBot = input;
			saveConfig();
			try { await api.changeNickname(input, event.threadID, api.getCurrentUserID()); } catch (e) {}
			return message.reply(`✦ Nickname → ${input}`);
		}
		if (state === "nicknameSetAll") {
			if (!input) return message.reply("𝗫 Invalid.");
			config.nickNameBot = input;
			saveConfig();
			let success = 0;
			try {
				const threads = await api.getThreadList(100, null, ["INBOX"]);
				for (const t of threads) {
					if (!t.isGroup) continue;
					try { await api.changeNickname(input, t.threadID, api.getCurrentUserID()); success++; } catch (e) {}
				}
			} catch (e) {}
			return message.reply(`✦ Nickname → ${input}\n› Updated in ${success} groups.`);
		}

		// ─── FCA OPTIONS ───
		if (state === "fcaOptions") {
			const keys = ["forceLogin", "listenEvents", "updatePresence", "listenTyping", "selfListen", "selfListenEvent", "autoMarkDelivery", "autoReconnect"];
			const key = keys[num - 1];
			if (!key) return message.reply("𝗫 Invalid selection (1–8).");
			config.optionsFca = config.optionsFca || {};
			config.optionsFca[key] = !config.optionsFca[key];
			saveConfig();
			try { api.setOptions({ [key]: config.optionsFca[key] }); } catch (e) {}
			return message.reply(`✦ ${key} — ${status(config.optionsFca[key])}`);
		}
	}
};
