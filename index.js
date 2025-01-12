const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./configs/token.config');

const colors = require('colors');


// Setting up the Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});


// Creating new collections of commands
client.commands = new Collection();
client.cooldowns = new Collection();

// Creating path to the commands folder
const folderPath = path.join(__dirname, 'commands');

// Creating an array of directory in commands folder
const commandFolders = fs.readdirSync(folderPath);

// Importing commands files
for (const folder of commandFolders) {
  const commandsPath = path.join(folderPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const files of commandFiles) {
    const filePath = path.join(commandsPath, files);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required 'data' or 'execute' property!`.red);
    }
  }
}


// Importing Events files
const eventPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);