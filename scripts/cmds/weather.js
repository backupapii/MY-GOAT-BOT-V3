const axios = require("axios");
const moment = require("moment-timezone");
const Canvas = require("canvas");
const fs = require("fs-extra");

Canvas.registerFont(
        __dirname + "/assets/font/BeVietnamPro-SemiBold.ttf", {
        family: "BeVietnamPro-SemiBold"
});
Canvas.registerFont(
        __dirname + "/assets/font/BeVietnamPro-Regular.ttf", {
        family: "BeVietnamPro-Regular"
});

function convertFtoC(F) {
        return Math.floor((F - 32) / 1.8);
}
function formatHours(hours) {
        return moment(hours).tz("Asia/Ho_Chi_Minh").format("HH[h]mm[p]");
}

// ── Fallback: wttr.in (no API key needed, always free) ───────────────────────
async function weatherFallback(area) {
  const res = await axios.get(`https://wttr.in/${encodeURIComponent(area)}?format=j1`, { timeout: 15000 });
  const d = res.data;
  const cur = d.current_condition[0];
  const area2 = d.nearest_area[0];
  const areaName = area2.areaName[0].value + ", " + area2.country[0].value;
  const today = d.weather[0];

  const tempC = cur.temp_C;
  const feelsLike = cur.FeelsLikeC;
  const desc = cur.weatherDesc[0].value;
  const humidity = cur.humidity;
  const wind = cur.windspeedKmph;
  const maxC = today.maxtempC;
  const minC = today.mintempC;

  let msg = `🌤️ Weather for: ${areaName}\n`;
  msg += `📍 Condition: ${desc}\n`;
  msg += `🌡️ Temperature: ${tempC}°C (Feels like ${feelsLike}°C)\n`;
  msg += `🌡️ Low/High: ${minC}°C — ${maxC}°C\n`;
  msg += `💧 Humidity: ${humidity}%\n`;
  msg += `💨 Wind: ${wind} km/h\n\n`;
  msg += `📅 3-Day Forecast:\n`;
  for (const day of d.weather.slice(0, 3)) {
    const date = day.date;
    const hi = day.maxtempC;
    const lo = day.mintempC;
    const desc2 = day.hourly[4]?.weatherDesc[0]?.value || "N/A";
    msg += `  • ${date}: ${lo}°C–${hi}°C, ${desc2}\n`;
  }
  msg += `\n🔁 Powered by: wttr.in (AccuWeather was unavailable)`;
  return msg;
}

// ── Fallback 2: Open-Meteo (geocoding + forecast) ────────────────────────────
async function weatherOpenMeteo(area) {
  const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(area)}&count=1&language=en`, { timeout: 10000 });
  const loc = geoRes.data.results?.[0];
  if (!loc) throw new Error("Location not found");

  const { latitude, longitude, name, country } = loc;
  const fRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=3`,
    { timeout: 15000 }
  );
  const c = fRes.data.current;
  const d = fRes.data.daily;

  const WMO = { 0:"Clear sky", 1:"Mainly clear", 2:"Partly cloudy", 3:"Overcast", 45:"Foggy", 51:"Light drizzle", 61:"Slight rain", 63:"Moderate rain", 65:"Heavy rain", 71:"Slight snow", 80:"Rain showers", 95:"Thunderstorm" };
  const desc = WMO[c.weather_code] || `Code ${c.weather_code}`;

  let msg = `🌤️ Weather for: ${name}, ${country}\n`;
  msg += `📍 Condition: ${desc}\n`;
  msg += `🌡️ Temperature: ${c.temperature_2m}°C (Feels like ${c.apparent_temperature}°C)\n`;
  msg += `💧 Humidity: ${c.relative_humidity_2m}%\n`;
  msg += `💨 Wind: ${c.wind_speed_10m} km/h\n\n`;
  msg += `📅 3-Day Forecast:\n`;
  for (let i = 0; i < 3; i++) {
    const dayDesc = WMO[d.weather_code[i]] || "N/A";
    msg += `  • ${d.time[i]}: ${d.temperature_2m_min[i]}°C–${d.temperature_2m_max[i]}°C, ${dayDesc}\n`;
  }
  msg += `\n🔁 Powered by: Open-Meteo (AccuWeather was unavailable)`;
  return msg;
}

module.exports = {
        config: {
                name: "weather",
                version: "2.0",
                author: "MD_SHAKIL",
                countDown: 5,
                role: 0,
                description: {
                        vi: "xem dự báo thời tiết hiện tại và 5 ngày sau",
                        en: "view weather forecast — 3 API fallbacks"
                },
                category: "ai",
                guide: {
                        vi: "{pn} <địa điểm>",
                        en: "{pn} <location>"
                },
                envGlobal: {
                        weatherApiKey: "d7e795ae6a0d44aaa8abb1a0a7ac19e4"
                }
        },

        langs: {
                vi: {
                        syntaxError: "Vui lòng nhập địa điểm",
                        notFound: "Không thể tìm thấy địa điểm: %1",
                        error: "Đã xảy ra lỗi: %1",
                        today: "Thời tiết hôm nay: %1\n%2\n🌡 Nhiệt độ thấp nhất - cao nhất %3°C - %4°C\n🌡 Nhiệt độ cảm nhận được %5°C - %6°C\n🌅 Mặt trời mọc %7\n🌄 Mặt trời lặn %8\n🌃 Mặt trăng mọc %9\n🏙️ Mặt trăng lặn %10\n🌞 Ban ngày: %11\n🌙 Ban đêm: %12"
                },
                en: {
                        syntaxError: "Please enter a location",
                        notFound: "Location not found: %1",
                        error: "An error has occurred: %1",
                        today: "Today's weather: %1\n%2\n🌡 Low - high temperature %3°C - %4°C\n🌡 Feels like %5°C - %6°C\n🌅 Sunrise %7\n🌄 Sunset %8\n🌃 Moonrise %9\n🏙️ Moonset %10\n🌞 Day: %11\n🌙 Night: %12"
                }
        },

        onStart: async function ({ args, message, envGlobal, getLang }) {
                const area = args.join(" ").trim();
                if (!area) return message.reply(getLang("syntaxError"));

                // ── Try AccuWeather (primary — canvas image) ──────────────────────────
                try {
                        const apikey = envGlobal.weatherApiKey;
                        let areaKey, dataWeather, areaName;

                        const response = (await axios.get(
                                `https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=vi-vn`,
                                { timeout: 15000 }
                        )).data;

                        if (!response || response.length === 0) throw new Error("notFound");
                        const data = response[0];
                        areaKey = data.Key;
                        areaName = data.LocalizedName;

                        dataWeather = (await axios.get(
                                `http://api.accuweather.com/forecasts/v1/daily/10day/${areaKey}?apikey=${apikey}&details=true&language=vi`,
                                { timeout: 15000 }
                        )).data;

                        const dataWeatherDaily = dataWeather.DailyForecasts;
                        const dataWeatherToday = dataWeatherDaily[0];
                        const msg = getLang("today", areaName, dataWeather.Headline.Text,
                                convertFtoC(dataWeatherToday.Temperature.Minimum.Value),
                                convertFtoC(dataWeatherToday.Temperature.Maximum.Value),
                                convertFtoC(dataWeatherToday.RealFeelTemperature.Minimum.Value),
                                convertFtoC(dataWeatherToday.RealFeelTemperature.Maximum.Value),
                                formatHours(dataWeatherToday.Sun.Rise), formatHours(dataWeatherToday.Sun.Set),
                                formatHours(dataWeatherToday.Moon.Rise), formatHours(dataWeatherToday.Moon.Set),
                                dataWeatherToday.Day.LongPhrase, dataWeatherToday.Night.LongPhrase);

                        const bg = await Canvas.loadImage(__dirname + "/assets/image/bgWeather.jpg");
                        const { width, height } = bg;
                        const canvas = Canvas.createCanvas(width, height);
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(bg, 0, 0, width, height);
                        let X = 100;
                        ctx.fillStyle = "#ffffff";
                        const days = dataWeather.DailyForecasts.slice(0, 7);
                        for (const item of days) {
                                const icon = await Canvas.loadImage("http://vortex.accuweather.com/adc2010/images/slate/icons/" + item.Day.Icon + ".svg");
                                ctx.drawImage(icon, X, 210, 80, 80);
                                ctx.font = "30px BeVietnamPro-SemiBold";
                                ctx.fillText(`${convertFtoC(item.Temperature.Maximum.Value)}°C `, X, 366);
                                ctx.font = "30px BeVietnamPro-Regular";
                                ctx.fillText(String(`${convertFtoC(item.Temperature.Minimum.Value)}°C`), X, 445);
                                ctx.fillText(moment(item.Date).format("DD"), X + 20, 140);
                                X += 135;
                        }

                        const pathSaveImg = `${__dirname}/tmp/weather_${areaKey}.jpg`;
                        await fs.ensureDir(`${__dirname}/tmp`);
                        fs.writeFileSync(pathSaveImg, canvas.toBuffer());
                        return message.reply({
                                body: msg,
                                attachment: fs.createReadStream(pathSaveImg)
                        }, () => fs.unlink(pathSaveImg).catch(() => {}));

                } catch (accuErr) {
                        // AccuWeather failed — try wttr.in
                        try {
                                const msg = await weatherFallback(area);
                                return message.reply(msg);
                        } catch (_) {}

                        // wttr.in also failed — try Open-Meteo
                        try {
                                const msg = await weatherOpenMeteo(area);
                                return message.reply(msg);
                        } catch (_) {}

                        return message.reply(`❌ All weather APIs failed for "${area}".\nTry a different location name.`);
                }
        }
};
