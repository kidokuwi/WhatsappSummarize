const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const ai = new GoogleGenerativeAI(process.env.AI_API_KEY);
const catChallengeSessions = new Map();
const messageCache = new Map();

console.log("Setting up WhatsApp Client configuration...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    }
});

client.on('ready', () => console.log('WhatsApp Bot is ready and listening!'));
client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('message_create', async (msg) => {
    try {
        const cleanBody = msg.body.toLowerCase().trim();
        const sender = msg.from;

        // Cache message to avoid broken getChat() natively
        if (!messageCache.has(sender)) messageCache.set(sender, []);
        const historyList = messageCache.get(sender);
        historyList.push(msg);
        if (historyList.length > 100) historyList.shift();

        // Simple Commands
        if (cleanBody === '!boop') { await msg.reply('Boop!'); return; }
        if (cleanBody === '!help') { await msg.reply('Commands: !boop, !help, !summarize'); return; }

        // --- SUMMARIZER (STABLE VERSION) ---
        if (cleanBody.startsWith('!summarize')) {
            const isYesterday = cleanBody.includes('yesterday');
            
            // Extract optional -l <max_lines> limit
            let maxLines = null;
            const match = cleanBody.match(/-l\s+(\d+)/);
            if (match) {
                maxLines = parseInt(match[1], 10);
            }

            await msg.reply("Fetching and summarizing...");

            let messages = [];
            try {
                // Try to get the chat object natively to fetch past history
                const chat = await msg.getChat();
                messages = await chat.fetchMessages({ limit: 100 });
            } catch (err) {
                // Fallback to our in-memory cache if the native method crashes (e.g. r: r error)
                console.log("Native fetch failed, falling back to in-memory cache.");
                messages = messageCache.get(sender) || [];
            }
            
            const startOfToday = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
            const startOfYesterday = startOfToday - 86400;

            let targetMessages = messages.filter(m => {
                const timestamp = m.timestamp;
                return (isYesterday 
                    ? (timestamp >= startOfYesterday && timestamp < startOfToday)
                    : (timestamp >= startOfToday)) 
                    && m.body && !m.body.startsWith('!');
            });

            if (maxLines && maxLines > 0) {
                targetMessages = targetMessages.slice(-maxLines);
            }

            if (targetMessages.length === 0) {
                await msg.reply("No messages found to summarize.");
                return;
            }

            const history = targetMessages.map(m => `${m.author || m.from}: ${m.body}`).join('\n');
            const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            try {
                const prompt = `Summarize this conversation concisely. ${maxLines ? `Keep the summary to a maximum of ${maxLines} lines/bullet points.` : ''}\nIMPORTANT: If the conversation is predominantly in Hebrew, write the summary in Hebrew. Otherwise, use the language of the conversation.\n\nConversation:\n${history}`;
                const result = await model.generateContent(prompt);
                await msg.reply(`*Summary:*\n\n${result.response.text()}`);
            } catch (apiError) {
                if (apiError.status === 429 || (apiError.message && apiError.message.toLowerCase().includes('quota'))) {
                    await msg.reply("Sorry, I've reached my AI processing quota for now! Please try again a bit later.");
                } else {
                    console.error("AI Generation Error:", apiError);
                    await msg.reply("Oops, something went wrong while trying to summarize.");
                }
            }
            return;
        }

    } catch (err) {
        console.error("Critical Handler Error:", err);
    }
});

client.initialize();