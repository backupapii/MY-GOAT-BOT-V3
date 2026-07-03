const history = [];
const topWinners = {};

module.exports = {
	config: {
		name: "spin",
		version: "1.0.0",
		author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
		description: "Advanced Spin Game",
		usage: "/spin | /spin 3 | /spin history | /spin top",
		cooldown: 5,
		role: 0,
		category: "fun"
	},

	onStart: async function ({ api, event, args }) {
		const { threadID, messageID, mentions } = event;

		try {

			if (args[0] === "history") {
				if (!history.length)
					return api.sendMessage(
						"❌ এখনো কোনো winner নেই!",
						threadID,
						messageID
					);

				let msg = "📜 SPIN HISTORY\n\n";
				history.slice(-15).reverse().forEach((x, i) => {
					msg += `${i + 1}. ${x}\n`;
				});

				return api.sendMessage(msg, threadID, messageID);
			}

			if (args[0] === "top") {
				const sorted = Object.entries(topWinners)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 10);

				if (!sorted.length)
					return api.sendMessage(
						"❌ এখনো কোনো data নেই!",
						threadID,
						messageID
					);

				let msg = "🏆 TOP WINNERS\n\n";

				sorted.forEach(([name, count], i) => {
					msg += `${i + 1}. ${name} ➜ ${count} wins\n`;
				});

				return api.sendMessage(msg, threadID, messageID);
			}

			const threadInfo = await api.getThreadInfo(threadID);

			let candidates = [];

			if (Object.keys(mentions).length > 0) {
				candidates = Object.keys(mentions);
			} else {
				candidates = threadInfo.participantIDs.filter(
					id => id != api.getCurrentUserID()
				);
			}

			let winnerCount = parseInt(args[0]) || 1;

			if (winnerCount < 1) winnerCount = 1;

			if (winnerCount > candidates.length)
				winnerCount = candidates.length;

			const winners = [];

			while (
				winners.length < winnerCount &&
				candidates.length > 0
			) {
				const index = Math.floor(
					Math.random() * candidates.length
				);

				const selected = candidates.splice(index, 1)[0];

				winners.push(selected);
			}

			let result = "🎡 𝗦𝗣𝗜𝗡 𝗥𝗘𝗦𝗨𝗟𝗧 🎡\n\n";

			for (let i = 0; i < winners.length; i++) {

				const info = await api.getUserInfo(winners[i]);
				const name = info[winners[i]]?.name || "Unknown";

				history.push(name);

				if (!topWinners[name])
					topWinners[name] = 0;

				topWinners[name]++;

				result += `🏆 ${i + 1}. ${name}\n`;
			}

			result += "\n✨ Congratulations!";

			return api.sendMessage(
				result,
				threadID,
				messageID
			);

		} catch (e) {
			console.log(e);
			return api.sendMessage(
				"❌ Spin error!",
				threadID,
				messageID
			);
		}
	}
};
