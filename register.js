require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, IntentsBitField, Partials, EmbedBuilder } = require('discord.js');

const clientId = '1159046385384046643'; // Replace with your bot's client ID

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();
client.setMaxListeners(20); // or any number that fits your needs

const commandFiles = fs.readdirSync('./command/').filter(file => file.endsWith('.js'));

const commands = [];
const registeredCommands = new Set();

for (const file of commandFiles) {
  const command = require(`./command/${file}`);
  if ('data' in command && 'execute' in command) {
    const commandName = command.data.name;
    if (registeredCommands.has(commandName)) {
      console.log(`Skipping duplicate command ${commandName} from file ${file}`);
      continue;
    }
    registeredCommands.add(commandName);
    client.commands.set(commandName, command);
    commands.push(command.data.toJSON());
    console.log(`[+] Command ${commandName} has been successfully registered.`);
  } else {
    console.log(`[!!!] The command at ./command/${file} is missing a required "data" or "execute" property.`);
  }
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('⭐⭐⭐ Started refreshing application (/) commands.');

    const embedStart = new EmbedBuilder()
      .setColor('#9883ff')
      .setTitle('Started refreshing application (/) commands.')
      .setTimestamp();

    client.once('ready', async () => {
      const logChannel = await client.channels.fetch('989174284305985587');
      await logChannel.send({ embeds: [embedStart] });
    });

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log('⭐⭐⭐ Successfully reloaded application (/) commands.');

    const embedSuccess = new EmbedBuilder()
      .setColor('#9883ff')
      .setTitle(`Successfully reloaded ${commands.length} application (/) commands.`)
      .setTimestamp();

    client.once('ready', async () => {
      const logChannel = await client.channels.fetch('989174284305985587');
      await logChannel.send({ embeds: [embedSuccess] });
    });

  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', async () => {
  const embedReady = new EmbedBuilder()
    .setColor('#83B4FF')
    .setTitle('🆙・Finishing Bot')
    .setDescription('A bot just became ready')
    .setTimestamp();

  const logChannel = await client.channels.fetch('989174284305985587');
  await logChannel.send({ embeds: [embedReady] });
});

const eventsPath = path.join(__dirname, './event');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: 'There was an error trying to execute that command!',
      ephemeral: true
    });
    return;
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error trying to execute that command!',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: 'There was an error trying to execute that command!',
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
