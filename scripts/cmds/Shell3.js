'use strict';
const { exec } = require('child_process');

module.exports = {
  config: {
    name:     'shell3',
    aliases:  ['sh3', 'terminal'],
    version:  '2.1',
    author:   '𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡',
    countDown: 3,
    role:     2,
    shortDescription: { en: 'Execute shell commands (owner only)' },
    category: 'owner',
    guide:    { en: '{pn} <command>\n\nExample: {pn} ls scripts/cmds | wc -l\n{pn} node --version' }
  },

  onStart: async function ({ message, args, event }) {
    const ownerUID = global.GoatBot?.config?.ownerUID;
    const adminBot = global.GoatBot?.config?.adminBot || [];
    const allowedUIDs = ownerUID ? [String(ownerUID), ...adminBot.map(String)] : adminBot.map(String);

    if (!allowedUIDs.includes(String(event.senderID)))
      return message.reply('❌ This command is restricted to bot owners only.');

    const cmd = args.join(' ').trim();
    if (!cmd) return message.reply('Usage: -shell3 <command>\nExample: -shell3 ls scripts/cmds');

    const BLACKLIST = ['rm -rf /', 'rm -f /', 'format', 'mkfs', 'dd if=', ':(){', 'fork bomb', '> /dev/sda', 'shutdown', 'reboot'];
    if (BLACKLIST.some(b => cmd.toLowerCase().includes(b)))
      return message.reply('❌ Dangerous command blocked!');

    message.reply(`⚙️ Executing: \`${cmd}\`...`);

    const opts = { timeout: 30000, maxBuffer: 1024 * 512 };
    exec(cmd, opts, (err, stdout, stderr) => {
      let out = (stdout || '') + (stderr ? `\n[stderr]:\n${stderr}` : '');
      let result = out.trim() || '(no output)';
      if (err) result = `[Error]: ${err.message}\n\n${result}`;
      if (result.length > 3000) result = result.slice(0, 3000) + '\n...(truncated)';
      message.reply(`$ ${cmd}\n\n${result}`);
    });
  }
};
