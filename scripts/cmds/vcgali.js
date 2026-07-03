const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
config: {
name: "vcgali",
version: "1.0",
author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
countDown: 5,
role: 2,
shortDescription: "Random voice",
longDescription: "Send random voice from Google Drive",
category: "media"
},

onStart: async function ({ message }) {
	try {
		const audioIds = [
			"1i-cvBv9zdo8V3LZmvm46gAijd-syt31g",
			"1iJVwY-3hCDAegfr0jr1iS-qreQKEKU07",
			"16Ro3rNxwIHVkyJiU_esasZ8WkpGoPZt7",
			"1B7qNu6yADkKot1X4E9LTg0taJK_Twwgb",
			"1Pm64d-l4LMNPoaoou02sbsq5aTxjC264",
			"1buXOkIP4Gy_0R7C7R3k9eYaRPyxNSZGp",
			"1UBUJj6CrHv3QhedQQCbsxukZqX8z0LrA",
			"1MaoP6L8B7mg5Q7elSHIH80vA0Xa1U1Ux",
			"1aSKaXQdgGVEvRU-IoiUzwN6X6QYi7D1_",
			"1q8DRfbM7Svx732hEq1tNtb_SzkUX76I2",
			"1nJ-jGRoEbT_bT38Llg9-1nCovv_np7Ug",
			"1sKQxztxreRVHoTzzp8V0QL3aum6iAT_B",
			"1yg_Uk87vjWsvj7V22iBjFtZIYOzR8S8e",
			"13vT5KXwFMsQNhHRy60YTiRhDIvjW72a7",
			"1-90Jmd1XW-uA4bNCQTkarce_Z0RQELTo",
			"1BcMTzLBSE3pIpHOyhz25A1LEDI-LvY4p",
			"1mRYVBv0-icCnQvkqHxg60VyjLFoKHUj5",
			"15nMleCNp0Y_e9D9vTxdMq_KZSOWND3uc",
			"1F3_FB9u2y3dZ2z7Ukf9CgDAESTP1TQgm",
			"1d_qT4Mfu6KsNSdOANQCoESJsyAZdnl1_",
			"1y2a_HNikXuH2rDSx4T8LGKlBNyewml-j",
			"13SEjJyI90f1xH3yofmrr9tLJTf4FhDAB",
			"1W8neXvux3NaiIZjjFN7DuOdg_MgA01-5"
		];

		const randomId = audioIds[Math.floor(Math.random() * audioIds.length)];
		const url = `https://drive.google.com/uc?export=download&id=${randomId}`;

		const filePath = path.join(__dirname, "cache", `vcgali_${Date.now()}.mp3`);

		await fs.ensureDir(path.join(__dirname, "cache"));

		const response = await axios({
			url,
			method: "GET",
			responseType: "stream"
		});

		const writer = fs.createWriteStream(filePath);
		response.data.pipe(writer);

		await new Promise((resolve, reject) => {
			writer.on("finish", resolve);
			writer.on("error", reject);
		});

		await message.reply({
			body: "🎙️ Random Voice",
			attachment: fs.createReadStream(filePath)
		});

		fs.unlinkSync(filePath);

	} catch (e) {
		console.log(e);
		return message.reply("❌ Audio send করতে সমস্যা হয়েছে");
	}
}

};
