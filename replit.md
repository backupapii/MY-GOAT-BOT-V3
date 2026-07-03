# SHAKIL BOT V3

A multi-functional Facebook Messenger bot built on GoatBot V2, with a web dashboard, AI integrations, and group management features.

## Setup

1. Set the `APPSTATE` environment secret with your Facebook session cookies (JSON format from a tool like c3c/fbstate).
2. The bot dashboard runs on port 3002.
3. The bot starts automatically when the workflow launches.

## Running

The workflow runs `bash start.sh`, which:
- Restores `account.txt` from the `APPSTATE` env var if missing
- Creates required directories
- Installs/verifies dependencies
- Applies FCA patches
- Starts `node index.js`

## User preferences

- Language: English
- Database: SQLite (default)
- Timezone: Asia/Dhaka
