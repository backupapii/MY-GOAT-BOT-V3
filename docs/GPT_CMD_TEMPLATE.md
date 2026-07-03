# SHAKIL BOT V3 — ChatGPT Command Template

## ✅ Standard Format (copy-paste to ChatGPT)

Tell ChatGPT: "Create a GoatBot V2 command with this exact format:"

```javascript
'use strict';
const axios = require('axios');

module.exports = {
  config: {
    name: "commandname",           // lowercase, no spaces
    aliases: ["alias1", "alias2"], // optional
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,                  // cooldown in seconds
    role: 0,                       // 0=everyone, 1=admin, 2=bot owner
    shortDescription: { en: "Short description" },
    longDescription: { en: "Long description" },
    category: "fun",               // fun, ai, tools, info, media, etc.
    guide: { en: "{pn} <input>\nExample: {pn} hello" }
  },

  langs: {
    en: {
      error: "❌ An error occurred: %1",
      noInput: "⚠️ Please provide input!"
    }
  },

  onStart: async function ({ api, event, args, message, getLang, prefix, commandName }) {
    // args = array of words after command name
    // message.reply("text") — send reply
    // message.reaction("✅", event.messageID) — react to message
    
    const input = args.join(" ").trim();
    if (!input) return message.reply(getLang("noInput"));

    try {
      // Your logic here
      const result = "Hello " + input;
      message.reply(result);
    } catch (err) {
      message.reply(getLang("error", err.message));
    }
  }
};
```

## ⚠️ Rules for ChatGPT commands to work 100%:
1. Always use `module.exports = { config: {...}, onStart: async function({...}) {} }`
2. `config.name` must be lowercase, no spaces
3. Use `message.reply()` not `api.sendMessage()` where possible
4. Wrap everything in try/catch
5. Add `'use strict';` at top
6. No top-level `await` outside async functions
7. Use `process.env.YOUR_KEY` for API keys (never hardcode)
8. Save file as `commandname.js` in `scripts/cmds/`
