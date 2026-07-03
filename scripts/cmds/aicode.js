const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
config: {
name: "aicode",
version: "1.0",
author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
countDown: 10,
role: 2,
shortDescription: "AI generate command code",
category: "tools",
guide: {
en: "/aicode <command idea>"
}
},

onStart: async function ({ api, event, args, message }) {
	try {
		const prompt = args.join(" ");
		if (!prompt)
			return message.reply("❌ Please give command idea\nExample: /aicode uid command");

		await message.reply("🧠 Generating code... please wait");

		// 👉 AI API (Replace with your API)
		const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
			model: "llama-3.1-70b-versatile",
			messages: [
				{
					role: "system",
					content: "You are a professional Node.js chatbot command generator for Goat Bot V2. Return ONLY clean module.exports code without explanation."
				},
				{
					role: "user",
					content: `Create a Goat Bot V2 command for: ${prompt}`
				}
			]
		}, {
			headers: {
				"Authorization": `Bearer ${process.env.GROQ_API_KEY || ""}`,
				"Content-Type": "application/json"
			}
		});

		let code = response.data.choices[0].message.content;

		const fileName = `aicode_${Date.now()}.js`;
		const filePath = path.join(__dirname, fileName);

		fs.writeFileSync(filePath, code);

		return message.reply({
			body: `✅ Code Generated!\n📄 File: ${fileName}\n⚠️ Please review before use`,
			attachment: fs.createReadStream(filePath)
		});

	} catch (err) {
		console.log(err);
		return message.reply("❌ Failed to generate code");
	}
}

};
