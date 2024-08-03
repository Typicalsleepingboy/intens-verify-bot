const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb://typicalsleepingboy:Logical91@ac-nmujy0y-shard-00-00.8m7nxuo.mongodb.net:27017,ac-nmujy0y-shard-00-01.8m7nxuo.mongodb.net:27017,ac-nmujy0y-shard-00-02.8m7nxuo.mongodb.net:27017/?replicaSet=atlas-ksbjnd-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=typicalsleepingboy';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Global variable to store the start time of the bot
let startTime = Date.now();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pinggggg')
    .setDescription('cek status.'),

  async execute(interaction) {
    // Send initial response
    const sent = await interaction.reply({ content: 'Waitt tunggu bentar....👾', fetchReply: true });
    
    // Calculate latencies
    const roundTripLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    // Calculate uptime
    const uptime = Date.now() - startTime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor((uptime % 86400000) / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);

    // Check MongoDB connection status
    let mongoStatus = '🔴 Offline';
    try {
      await client.connect();
      mongoStatus = '🟢 Online';
    } catch (error) {
      console.error('MongoDB connection failed:', error);
    } finally {
      await client.close();
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#9883ff')
      .setTitle('Bot Latency and MongoDB Status')
      .addFields(
        { name: '📈 Websocket Latency', value: `\`\`\`${roundTripLatency}ms\`\`\``, inline: true },
        { name: '📉 API Latency', value: `\`\`\`${apiLatency}ms\`\`\``, inline: false },
        { name: '👾 Intens Uptime', value: `\`\`\`${days} days, ${hours} hours, ${minutes} minutes, and ${seconds.toString().padStart(2, '0')} seconds\`\`\``, inline: false },
        { name: '🍃 MongoDB Status', value: `\`\`\`${mongoStatus}\`\`\``, inline: false  }
      )
      .setFooter({ text: 'By 48Intens Official and Full automated 🤖'})
      .setThumbnail(interaction.client.user.displayAvatarURL());

    // Edit reply with embed
    await interaction.editReply({ content: '', embeds: [embed] });
  },
};