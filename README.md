# WhatsApp AI Summarizer Bot

A WhatsApp bot that reads group chats and provides concise, intelligent summaries using Google's Gemini AI. 

This guide outlines the steps required to set up and run this bot on a local machine.

---

## Prerequisites

Before beginning, ensure the following software is installed on your computer:

1. **Node.js**: The bot runs on Node.js. Download and install the LTS (Long Term Support) version from [nodejs.org](https://nodejs.org/).
2. **Google Chrome**: The bot uses your local Google Chrome installation to run WhatsApp Web in the background. Make sure Chrome is installed on your system.
3. **Gemini API Key**: An API key is required to use Google's Gemini AI. 
   - Navigate to [Google AI Studio](https://aistudio.google.com/).
   - Sign in with your Google account and click **Get API Key**.
   - Create a new key and copy it for later use.

---

## Installation and Setup

### Step 1: Download the Source Code
Download this entire project directory to your computer and extract the files.

### Step 2: Open your Terminal
Open your terminal or command prompt:
- **Windows**: Press the Windows key, type `cmd`, and press Enter.
- **Mac**: Press `Cmd + Space`, type `Terminal`, and press Enter.

Navigate to the folder where you extracted the bot. For example:
```bash
cd path/to/whatsapp-summarizer-bot
```

### Step 3: Install Dependencies
Install the required libraries necessary for the bot to function. Run the following command:
```bash
npm install
```

*(Note: If you encounter Puppeteer download errors on Windows, you can skip the Chromium download by running `set PUPPETEER_SKIP_DOWNLOAD=true && npm install` instead).*

### Step 4: Configure the API Key
In the main project folder, create a new text file and name it exactly **`.env`** (ensure the dot at the beginning is included). 

Open the `.env` file in a text editor and define your Gemini API key as follows:
```env
AI_API_KEY=your_copied_api_key_here
```

### Step 5: Verify the Chrome Path
Open the `index.js` file and locate line 15. The bot is currently configured to look for Google Chrome at a specific path:
`C:\Program Files\Google\Chrome\Application\chrome.exe`

- If you are using Windows and installed Chrome in the default location, no action is required.
- If you installed Chrome in a custom directory, or if you are using macOS/Linux, you must update this path to point to your actual Chrome executable. Otherwise, the bot will fail to start.

---

## Running the Bot

Once the setup is complete, return to your terminal and start the bot:
```bash
node index.js
```

1. You will see an initialization message: `"Setting up WhatsApp Client configuration..."`.
2. After a brief loading period, a **QR Code** will be generated in your terminal.
3. Open WhatsApp on your mobile device -> Tap **Settings** (or the three dots) -> **Linked Devices** -> **Link a Device**.
4. Scan the QR code displayed on your computer screen.
5. The terminal should then display: `"WhatsApp Bot is ready and listening!"`

---

## Usage Guide

You can invite the bot's phone number to any group chat, or message it directly.

- `!help` - Display a list of available commands.
- `!boop` - Verify that the bot is responsive.
- **`!summarize`** - The bot will read the last 100 messages in the chat and generate a bulleted summary.
- **`!summarize -l <number>`** (e.g., `!summarize -l 20`) - Limit the summary to the specified number of recent messages, keeping the output concise.
- **`!summarize yesterday`** - Summarize only the messages sent during the previous day.

*(Note: The bot intelligently detects the primary language of the conversation. If the conversation is in Hebrew, the summary will automatically be generated in Hebrew.)*
