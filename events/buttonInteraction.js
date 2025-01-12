// Description: This file has the code for handling button interactions in the duel game.

const { Events, ButtonBuilder } = require('discord.js');

const { pendingGames, activeGames } = require('../helper/runningGames');
const { maxHealth, maxPotions, createEmbed, createActionRow, startTurnTimer, PURPLE } = require('../helper/constants');
const { startGame } = require('../helper/game');

module.exports = {

    name: Events.InteractionCreate,
    execute: async (interaction) => {
        
        if(!interaction.isButton()) return;

        // Accept or Decline the duel
        if(interaction.customId == 'accept' || interaction.customId == 'decline') {
            
            try {

                const game = pendingGames.get(interaction.user.id);

                if(!game) {
                    return await interaction.reply({
                        content: 'This duel is not meant for You!',
                        ephemeral: true
                    });
                }

                // Destructure the game object
                const {challenger, challenged, duelMessage} = game;

                // If the user declines the duel
                if(interaction.customId === 'decline') {
                    pendingGames.delete(challenged.id);
                    return await duelMessage.edit({
                        content: 'Duel Declined!',
                        components: []
                    });
                }

                pendingGames.delete(challenged.id);

                // Setting the active game
                const gameId = `${challenger.id}-${challenged.id}`;
                activeGames.set(gameId, {
                    challenger: {
                        user: challenger,
                        health: maxHealth,
                        potions: maxPotions
                    },
                    challenged: {
                        user: challenged,
                        health: maxHealth,
                        potions: maxPotions
                    },
                    message: null,
                });

                const embed = createEmbed(
                    'Duel Started!',
                    `Duel between <@${challenger.id}> v/s <@${challenged.id}> has started!\n<@${challenger.id}>, It's your turn!`,
                    PURPLE
                )

                const row = createActionRow([
                    new ButtonBuilder().setCustomId('sword').setLabel('Sword').setEmoji('309458615041916928').setStyle('Primary'),
                    new ButtonBuilder().setCustomId('bow').setLabel('Bow').setEmoji('1258508098155450449').setStyle('Primary'),
                    new ButtonBuilder().setCustomId('shield').setLabel('Shield').setEmoji('1114899495294087298').setStyle('Primary'),
                    new ButtonBuilder().setCustomId('potion').setLabel('Heal').setEmoji('657134691450880000').setStyle('Success')
                ]);

                // Start the duel. Import the startGame function from the game.js file
                startGame(gameId, interaction);

                
            } catch (err) {
                console.log('Error: ', err);
                await interaction.reply({
                    content: 'There was an error while processing the button interaction!',
                    ephemeral: true
                })
            }


        }
    }

}