module.exports = {
  config: {
    name: "prefix",
    version: "1.5",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show or change bot prefix" },
    longDescription: { en: "View current prefix or change it (admin only)" },
    category: "system",
    guide: {
      en: "{pn}           — show current prefix\n{pn} set <new>  — change prefix (admin)\n{pn} reset        — reset to default (admin)\n\nExample: -prefix set !"
    }
  },

  langs: {
    en: {
      currentPrefix: "📌 Current prefix: %1\n\n💡 Example: %1help",
      notAdmin: "❌ Only bot admins can change the prefix!",
      changed: "✅ Prefix changed to: %1\n\n💡 Now use: %1help",
      reset: "✅ Prefix reset to default: %1",
      noPrefix: "❌ Please provide a new prefix!\n\nUsage: -prefix set !",
      invalid: "❌ Prefix must be 1-3 characters!"
    }
  },

  onStart: async function ({ message, args, event, getLang }) {
    const { config } = global.GoatBot;
    const isAdmin = config.adminBot.includes(event.senderID);
    const sub = (args[0] || "").toLowerCase();

    if (!sub) {
      return message.reply(getLang("currentPrefix", config.prefix));
    }

    if (sub === "set") {
      if (!isAdmin) return message.reply(getLang("notAdmin"));
      const newPrefix = args[1];
      if (!newPrefix) return message.reply(getLang("noPrefix"));
      if (newPrefix.length < 1 || newPrefix.length > 3) return message.reply(getLang("invalid"));
      config.prefix = newPrefix;
      return message.reply(getLang("changed", newPrefix));
    }

    if (sub === "reset") {
      if (!isAdmin) return message.reply(getLang("notAdmin"));
      config.prefix = "-";
      return message.reply(getLang("reset", "-"));
    }

    return message.reply(getLang("currentPrefix", config.prefix));
  }
};
