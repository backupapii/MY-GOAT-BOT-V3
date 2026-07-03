const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    aliases: ["cmdlist", "menu", "cmd"],
    version: "5.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command list and full usage details",
      bn: "কমান্ড তালিকা ও সম্পূর্ণ ব্যবহারের নিয়ম দেখুন"
    },
    longDescription: {
      en: "View command list grouped by category, or get full details of any command including usage, examples, cooldown, and required role.",
      bn: "ক্যাটাগরি অনুযায়ী কমান্ড তালিকা দেখুন, অথবা যেকোনো কমান্ডের সম্পূর্ণ তথ্য দেখুন।"
    },
    category: "info",
    guide: {
      en: "{pn} — show all commands\n{pn} <command> — show full details of a command\n\nExample:\n{p}help\n{p}help ping\n{p}help play",
      bn: "{pn} — সব কমান্ড দেখুন\n{pn} <কমান্ড> — কমান্ডের বিস্তারিত দেখুন"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);
    const langCode = threadData?.data?.lang || global.GoatBot.config.language || "en";

    // ─── LIST MODE (no args) ────────────────────────────────────────────────
    if (args.length === 0) {
      const categories = {};

      for (const [name, value] of commands) {
        if (value.config.role > 0 && role < value.config.role) continue;
        const category = (value.config.category || "misc").toLowerCase();
        if (!categories[category]) categories[category] = [];
        if (!categories[category].includes(name)) categories[category].push(name);
      }

      let msg = "";
      Object.keys(categories).sort().forEach((cat) => {
        const emoji = categoryEmoji(cat);
        msg += `\n╭──${emoji} ${cat.toUpperCase()} ──⭓`;
        const names = categories[cat].sort();
        for (let i = 0; i < names.length; i += 3) {
          const chunk = names.slice(i, i + 3).map(n => `✧${n}`);
          msg += `\n│ ${chunk.join("  ")}`;
        }
        msg += `\n╰─────────────⭓\n`;
      });

      const total = commands.size;
      msg += langCode === "bn"
        ? `\n⭔ মোট: ${total}টি কমান্ড\n⭔ ${prefix}help <কমান্ড> লিখলে বিস্তারিত দেখবে\n`
        : `\n⭔ Total: ${total} commands\n⭔ Type ${prefix}help <cmd> for full details\n`;
      msg += `\n╭─✦ 𝐒𝐇𝐀𝐊𝐈𝐋 𝐁𝐎𝐓 𝐕𝟑\n╰─✦ by 𝐒𝐇𝐀𝐊𝐈𝐋 𝐇𝐎𝐒𝐒𝐄𝐍`;

      try {
        const sent = await message.reply({ body: msg });
        setTimeout(() => message.unsend(sent.messageID).catch(() => {}), 90000);
      } catch (e) { console.error("Help list error:", e); }

    // ─── DETAIL MODE (args given) ───────────────────────────────────────────
    } else {
      const query = args[0].toLowerCase();
      const command = commands.get(query) || commands.get(aliases.get(query));

      if (!command) {
        // suggest similar commands
        const similar = [...commands.keys()].filter(n => n.includes(query) || query.includes(n.slice(0, 3))).slice(0, 5);
        let msg = langCode === "bn"
          ? `❌ "${query}" নামে কোনো কমান্ড নেই!\n`
          : `❌ Command "${query}" not found!\n`;
        if (similar.length > 0) {
          msg += langCode === "bn"
            ? `\n🔍 এগুলো হয়তো খুঁজছেন:\n${similar.map(s => `  • ${prefix}${s}`).join("\n")}`
            : `\n🔍 Did you mean:\n${similar.map(s => `  • ${prefix}${s}`).join("\n")}`;
        }
        return message.reply(msg);
      }

      const c = command.config;
      const roleText = roleLabel(c.role, langCode);
      const isBn = langCode === "bn";

      // Build guide / usage section
      const rawGuide = c.guide?.[langCode] || c.guide?.en || c.usages || "";
      const guide = rawGuide
        .replace(/{pn}/g, prefix + c.name)
        .replace(/{p}/g, prefix)
        .replace(/{n}/g, c.name)
        .trim();

      // Short + long description
      const shortDesc = c.shortDescription?.[langCode] || c.shortDescription?.en
        || c.shortDescription || "";
      const longDesc = c.longDescription?.[langCode] || c.longDescription?.en
        || c.longDescription || c.description?.[langCode] || c.description?.en
        || c.description || "";

      // Aliases list
      const aliasList = (c.aliases && c.aliases.length > 0)
        ? c.aliases.filter(a => a !== c.name).join(", ")
        : (isBn ? "নেই" : "None");

      // Cooldown
      const cd = c.countDown ? `${c.countDown}s` : (isBn ? "নেই" : "None");

      // Category
      const cat = c.category || "misc";

      // Build the full detail card
      const line = "─────────────────────";
      let out = "";

      out += `╭${line}⭓\n`;
      out += `│ 🎯 ${isBn ? "কমান্ড" : "Command"}: ${prefix}${c.name}\n`;
      if (aliasList !== "নেই" && aliasList !== "None") {
        out += `│ 🔗 ${isBn ? "শর্টকাট" : "Aliases"}: ${aliasList}\n`;
      }
      out += `│ 🗂️ ${isBn ? "ক্যাটাগরি" : "Category"}: ${cat}\n`;
      out += `├${line}⭓\n`;

      if (shortDesc) {
        out += `│ 📌 ${isBn ? "সংক্ষেপে" : "Summary"}: ${shortDesc}\n`;
      }
      if (longDesc && longDesc !== shortDesc) {
        out += `│ 📝 ${isBn ? "বিস্তারিত" : "Details"}: ${longDesc}\n`;
      }
      if (!shortDesc && !longDesc) {
        out += `│ 📝 ${isBn ? "বিবরণ" : "Description"}: N/A\n`;
      }

      out += `│ 👑 ${isBn ? "লেখক" : "Author"}: ${c.author || "Unknown"}\n`;
      out += `├${line}⭓\n`;

      // Usage section — most important
      if (guide) {
        const guideLines = guide.split("\n");
        out += `│ 🚀 ${isBn ? "কিভাবে ব্যবহার করবে" : "How to use"}:\n`;
        guideLines.forEach(gl => {
          if (gl.trim()) out += `│   ${gl}\n`;
        });
      } else {
        out += `│ 🚀 ${isBn ? "ব্যবহার" : "Usage"}: ${prefix}${c.name}\n`;
      }

      out += `├${line}⭓\n`;
      out += `│ ⏱️ ${isBn ? "কুলডাউন" : "Cooldown"}: ${cd}\n`;
      out += `│ 🔐 ${isBn ? "অনুমতি লাগবে" : "Required role"}: ${roleText}\n`;
      out += `│ ⭐ ${isBn ? "ভার্সন" : "Version"}: ${c.version || "1.0"}\n`;
      out += `╰${line}⭓`;

      try {
        const sent = await message.reply({ body: out });
        setTimeout(() => message.unsend(sent.messageID).catch(() => {}), 90000);
      } catch (e) { console.error("Help detail error:", e); }
    }
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleLabel(role, lang) {
  const isBn = lang === "bn";
  const map = {
    0: isBn ? "0 — সবাই ব্যবহার করতে পারবে" : "0 — Everyone",
    1: isBn ? "1 — গ্রুপ অ্যাডমিন" : "1 — Group Admin",
    2: isBn ? "2 — বট অ্যাডমিন" : "2 — Bot Admin",
    3: isBn ? "3 — ডেভেলপার" : "3 — Developer",
    4: isBn ? "4 — VIP ইউজার" : "4 — VIP User",
    5: isBn ? "5 — NSFW" : "5 — NSFW"
  };
  return map[role] !== undefined ? map[role] : `${role}`;
}

function categoryEmoji(cat) {
  const map = {
    "info": "ℹ️", "fun": "🎮", "media": "🎬", "music": "🎵", "game": "🎲",
    "economy": "💰", "utility": "🔧", "admin": "👑", "owner": "🔑",
    "box chat": "📦", "ai": "🤖", "ai-image": "🖼️", "image": "🖼️",
    "nsfw": "🔞", "18+": "🔞", "system": "⚙️", "misc": "📌",
    "social": "👥", "search": "🔍", "download": "⬇️", "group": "👥",
    "anime": "🎌", "moderation": "🛡️", "reaction": "💬", "tools": "🛠️"
  };
  return map[cat.toLowerCase()] || "📂";
}
