---
name: SHAKIL BOT V3 author lock removal
description: Many merged commands contain author lock mechanisms (process.exit) that crash the bot when author name is changed; how to safely remove them.
---

# Author Lock Removal in Merged Commands

## The Rule
Any command merged from Ashik, GoatV2, or V2dash repos may contain author lock code that calls `process.exit(1)` if `config.author` doesn't match the original author. This ALWAYS triggers because we replace all authors with `𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡` (bold unicode), which never matches plain-ASCII lock strings like `"SHAKIL-HOSSEN"`.

**Why:** The upstream repo authors added these locks to prevent redistribution. After renaming the author field, all locks trigger.

## Patterns to Remove
1. `if (module.exports.config.author !== AUTHOR) { ... process.exit(1) ... }`
2. `const obfuscatedAuthor = String.fromCharCode(77,97,104,77,85,68); if (...obfuscatedAuthor...) { ... }`
3. `// 🔒 AUTHOR LOCK` comment lines
4. Trailing `process.exit` blocks at end of file

## Critical Warning: Cleanup Script Truncation Risk
The author lock cleanup Python script can accidentally TRUNCATE files if a `process.exit` block appears near a template literal or complex control structure. Always verify file sizes after cleanup:
- Run `wc -l scripts/cmds/*.js | sort -n | head -20` to spot suspiciously short files
- If a file that should be 100+ lines is now 22 lines, recover from: `git show HEAD:path/to/file.js`

**How to apply:** Run author lock cleanup AFTER every merge batch from external repos. Run `node --check` syntax check on all files after cleanup. Any file with <30 lines after cleanup should be manually inspected and recovered from git if needed.
