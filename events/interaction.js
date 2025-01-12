// Description: Handles the interactionCreate event

const {
    Events,
    Collection
} = require('discord.js');
const colors = require('colors');

module.exports = {
name: Events.InteractionCreate,
execute: async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    const { cooldowns } = interaction.client;

    if (!command) {
    console.log(`No command matching ${interaction.commandName} was found!`.yellow);
    return;
    }

    // Cooldowns
    if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    defaultCooldownDuration = 5;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        return interaction.reply({
        content: `You have already used this command! Please wait while the cooldown for \`\\${command.data.name}\` ends and you can use it again <t:${expiredTimestamp}:R>.`,
        ephemeral: true
        })
    }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);


    try {
    await command.execute(interaction);
    } catch (err) {
    console.log(err);
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true
        });
    } else {
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true
        });
    }
    }
}
}