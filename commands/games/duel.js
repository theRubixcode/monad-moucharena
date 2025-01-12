// Description: Duel command to start a duel with a friend

const { SlashCommandBuilder, ButtonBuilder } = require('discord.js');
const { pendingGames, activeGames } = require('../../helper/runningGames');
const { createEmbed, createActionRow, duelAcceptTimeout, BLUE } = require('../../helper/constants');

module.exports = {

    // Creating a new SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName('duel')
        .setDescription('Start the Duel with your friend!')
        .addUserOption(option =>
            option
                .setName('opponent')
                .setDescription('The user you want to duel with')
                .setRequired(true)
        ),

    // Setting up the interaction callback function for the command
    execute: async (interaction) => {

        try {
            
            // Getting the challenger and challenged user
            const challenger = interaction.user;
            const challenged = interaction.options.getUser('opponent');

            // Checking if the challenger and challenged user are the same
            if(!challenged || challenged.id === challenger.id) {
                return await interaction.reply({
                    content: 'You cannot duel with yourself!', 
                    ephemeral: true
                });
            }

            // Checking if the challenged user is already in a game
            if(pendingGames.has(challenged.id) || activeGames.has(challenged.id)) {
                return await interaction.reply({
                    content: `**${challenged.username}** is already in a game!`, 
                    ephemeral: true
                });
            }

            const embed = createEmbed(
                'Duel Request',
                `<@${challenger.id}> has challenged you to a duel! Will you accept?`,
                BLUE
            )

            const row = createActionRow([
                new ButtonBuilder().setCustomId('accept').setLabel('✔ Accept').setStyle('Success'),
                new ButtonBuilder().setCustomId('decline').setLabel('❌ Decline').setStyle('Danger')
            ]);

            // Sending the duel request message
            const duelMessage = await interaction.reply({
                content: `<@${challenged.id}>`,
                embeds: [embed],
                components: [row]
            });

            // Adding the pending game to the pendingGames map
            pendingGames.set(challenged.id, {
                challenger,
                challenged,
                duelMessage });

            // Setting a timeout for the duel request
            setTimeout(async () => {
                if(pendingGames.has(challenged.id)) {
                    pendingGames.delete(challenged.id);
                    await duelMessage.edit({
                        content: `Duel request has expired!`,
                        components: []
                    });
                }
            }, duelAcceptTimeout)

        } catch (error) {
            console.error('Error: ', error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
            
        }

    }
}