require('dotenv').config();
const { Client, IntentsBitField, ActivityType, Partials } = require('discord.js');
const checkMongoDBStatus = require('./mongoose');
const Verification = require('./models/verification'); 
require('./register.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message]
});

client.once('ready', async () => {
    console.log('Bot is online!');

    await checkMongoDBStatus();

    const updatePresence = async () => {
        try {
            const verificationCount = await Verification.countDocuments({});

            const status = [
                { type: ActivityType.Playing, name: "Made with 💖 By 48intens" },
                { type: ActivityType.Listening, name: "Verify status 🗝️" },
                { type: ActivityType.Watching, name: `${verificationCount} people verified 🗝️` },
            ];

            let current = 0;

            setInterval(() => {
                client.user.setPresence({
                    activities: [status[current]],
                    status: "idle"
                })
                current = (current + 1) % status.length;
            }, 4000);
        } catch (error) {
            console.error('Error updating presence:', error);
        }
    };

    updatePresence();

    console.log(`[INFO] ${client.user.username} is ready with ${client.guilds.cache.size} servers`);
});

client.login(process.env.DISCORD_TOKEN);