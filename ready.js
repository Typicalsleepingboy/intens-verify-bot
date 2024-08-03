const { ActivityType } = require('discord.js');

module.exports = async (client) => {
  console.log('Bot is online!');

  setInterval(async () => {
    try {
      const servers = client.guilds.cache.size;
      const members = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

      const status = [
        { type: ActivityType.Playing, name: "Made with By 48intens" },
        { type: ActivityType.Listening, name: "Verify status " },
        { type: ActivityType.Watching, name: `On ${servers} Server with ${members} Users` },
        { type: ActivityType.Listening, name: `.Sekarang sedang jatuh cinta` },
      ];

      const index = Math.floor(Math.random() * status.length);

      await 
client.user.setStatus("idle");       client.user.setActivity(status[index].name, { type: status[index].type });
    } catch (error) {
      console.error(error);
    }
  }, 4000);

  console.log(`[INFO] ${client.user.username} is ready with ${client.guilds.cache.size} server`);
};