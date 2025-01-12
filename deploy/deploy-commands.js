// Description: This script is used to deploy the commands to the Discord API.

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token, client_id } = require('../configs/token.config');

const commands = [];

const foldersPath = path.join(__dirname, '../commands');
const commandsFolders = fs.readdirSync(foldersPath);

// Loop through each folder in the commands directory
for (const folder of commandsFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  // Loop through each file in the folder
  for (const file of commandsFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required 'data' or 'execute' property`);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(client_id),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (err) {
    console.log(err);
  }
})();