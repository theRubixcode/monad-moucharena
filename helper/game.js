// Description: This file contains the functions to start the game, handle the duel logic, and end the game. The startGame function initializes the duel between two players. The healthBar function generates a health bar emoji based on the player's health. The sendTurnMsg function sends the turn message to the players and collects their choices. The duel function compares the attacker and defender choices and determines the outcome of the duel. The changeTurn function switches the turns between the players. The gameOver function ends the game and declares the winner. These functions are used to manage the game flow and interactions between the players.

const { ButtonBuilder } = require("@discordjs/builders");
const { createEmbed, PURPLE, createActionRow, RED, GREEN, turnTimeout, GOLD, turnWarning } = require("./constants");
const { activeGames } = require("./runningGames");


// Program to handle the duel start logic
const startGame = async (gameId, interaction) => {

    try {

    // Get the game from the activeGames Map
    const game = activeGames.get(gameId);
    if (!game) return;

    const { challenger, challenged } = game;
    let attacker, defender;

    // Randomly select the attacker and Defender - Attacker goes first
    attacker = Math.random() > 0.5 ? challenger : challenged;
    defender = attacker === challenger ? challenged : challenger;

    // Creating the embed for the duel start
    const embed = createEmbed(
        '🤺 Duel Started!',
        `Duel between <@${game.challenger.user.id}> v/s <@${game.challenged.user.id}> has started!
        \n\n\`Attacker\`: ${attacker.user.username} - ${healthBar(attacker.health)} (${attacker.health} HP) - ${attacker.potions} Potions
        \n\`Defender\`: ${defender.user.username} - ${healthBar(defender.health)} (${defender.health} HP) - ${defender.potions} Potions`,
        PURPLE
    )

    // Sending Message to the channel
    await interaction.reply({
        content: `**${attacker.user.username}** v/s **${defender.user.username}**`,
        embeds: [embed],
    });

    // startTurnTimer(gameId);
    sendTurnMsg(attacker, defender, interaction, gameId);


    } catch (err) {
        console.error('Error: ', err);
        interaction.editReply({
            content: 'There was an error while processing the duel start!',
            ephemeral: true
        });
    }
}


// Function to get the healthbar
const healthBar = (health) => {
    const hearts = Math.ceil(health / 10);
    return '💜'.repeat(hearts) + ' '.repeat(10 - hearts);
}

// Function to start the turn timer
const sendTurnMsg = async (attacker, defender, interaction, gameId) => {

    // Attacker choices
    const attackChoice = createActionRow([
        new ButtonBuilder().setCustomId('sword').setLabel('Sword').setEmoji({ id: '309458615041916928' }).setStyle('Primary'),
        new ButtonBuilder().setCustomId('bow').setLabel('Bow').setEmoji({ id: '1258508098155450449' }).setStyle('Primary'),
        new ButtonBuilder().setCustomId('potion').setLabel(`Heal (${attacker.potions})`).setEmoji({ id: '657134691450880000' }).setStyle('Success').setDisabled(attacker.potions === 0),
    ])

    const attackEmbed = createEmbed(
        '⚔️ Choose your Attack!',
        `**${attacker.user.username}**, it's your turn!`,
        RED
    )

    // Defender choices
    const defendChoice = createActionRow([
        new ButtonBuilder().setCustomId('shield').setLabel('Shield').setEmoji({ id: '1114899495294087298' }).setStyle('Primary'),
        new ButtonBuilder().setCustomId('dodge').setLabel('Dodge').setEmoji({ id: '698355944685436959' }).setStyle('Primary'),
        new ButtonBuilder().setCustomId('potion').setLabel(`Heal (${defender.potions})`).setEmoji({ id: '657134691450880000' }).setStyle('Success').setDisabled(defender.potions === 0),
    ])

    const defendEmbed = createEmbed(
        '🛡️ Choose your Defence!',
        `**${defender.user.username}**, it's your turn!`,
        GREEN
    )

    // Send attacker turn message
    const attakerMsg = await interaction.channel.send({
        content: `<@${attacker.user.id}>`,
        embeds: [attackEmbed],
        components: [attackChoice]
    })

    const atkFilter = (i) => (i.customId === 'sword' || i.customId === 'bow' || i.customId === 'potion') && i.user.id === attacker.user.id;
    const atkCollector = attakerMsg.createMessageComponentCollector({ filter: atkFilter, time: turnTimeout });

    // Setting warning message for the attacker to response
    const atkWarning = setTimeout(async () => {
        await interaction.channel.send({
            content: `⚠️ <@${attacker.user.id}> has only \`15 sec\` left to response!`,
            embeds: [attackEmbed],
            components: []
        })
    }, turnWarning);


    // Collecting response from the user while interacting for Attacking
    atkCollector.on('collect', async (atkInteract) => {

        // creating choices array for [Attack Choice, Defender Choice]
        let choices = []

        // Clearing atkWarning timeout when attacker responded
        clearTimeout(atkWarning);

        // Sending error message when anyone else want to click the button
        if(atkInteract.user.id !== attacker.user.id) {
            return await atkInteract.channel.send({
                content: 'You are not allowed to click this button!',
                ephemeral: true
            })
        }

        // Adding attack choice
        choices.push(atkInteract.customId);
        
        // Send defender turn message
        const defenderMsg = await atkInteract.channel.send({
            content: `<@${defender.user.id}>, Attacker has chosen the Item!`,
            embeds: [defendEmbed],
            components: [defendChoice]
        })

        const defFilter = (i) => (i.customId === 'shield' || i.customId === 'dodge' || i.customId === 'potion') && i.user.id === defender.user.id;
        const defCollector = defenderMsg.createMessageComponentCollector({ filter: defFilter, time: turnTimeout });

        // Setting warning message for the defender to response
        const defWarning = setTimeout(async () => {
            await atkInteract.channel.send({
                content: `⚠️ <@${defender.user.id}> has only \`15 sec\` left to response!`,
                embeds: [defendEmbed],
                components: []
            })
        }, turnWarning);


        // Collecting responses from the user while interacting for Defending
        defCollector.on('collect', async (defInteract) => {

            // Clearing defWarning timeout when defender responded
            clearTimeout(defWarning);

            // Sending error message when anyone else want to click the button
            if(defInteract.user.id !== defender.user.id) {
                return await defInteract.channel.send({
                    content: 'You are not allowed to click this button!',
                    ephemeral: true
                })
            }

            // Adding def choice
            choices.push(defInteract.customId);

            // Game duel logic
            duel(choices, attacker, defender, interaction, gameId);
            
        })

        // Timeout for not responding in time
        defCollector.on('end', async (collected) => {

            if(collected.size === 0) {
                return gameOver('TimeOut! Defender didn\'t responded in time.', attacker, defender, attacker, interaction, gameId);
            }

        })
    })

    
    // Timeout for not responding in time
    atkCollector.on('end', async (collected) => {

        if(collected.size === 0) {

            return gameOver('TimeOut! Attacker didn\'t responded in time.', attacker, defender, defender, interaction, gameId);
        }

    })

}


// Duel Logic
const duel = async (choices, attacker, defender, interaction, gameId) => {

    try {
        
        const [attackerChoice, defenderChoice] = choices;

        const EmbedMsg = (msg) => createEmbed(
            `${msg}`,
            `\`Attacker\` - ${attackerChoice}\n\`Defender\` - ${defenderChoice}`,
            PURPLE
        )

        if(attackerChoice === 'sword' && defenderChoice === 'shield') {
            
            // Sword vs Shield
            // Attack is defended by the defender
            await interaction.channel.send({
                content: '# Battle Decided! ✨',
                embeds: [EmbedMsg('🛡️ Defended!')],
            })


        } else if(attackerChoice === 'sword' && defenderChoice === 'dodge') {
            
            // Sword vs Dodge
            // Defender looses 35 HP (Sword cannot be dodged)

            (defender.health -= 35) <= 0 ? defender.health = 0 : defender.health;

            if(defender.health <= 0) {

                await interaction.channel.send({
                    content: '# Battle Decided! ✨',
                    embeds: [EmbedMsg('Sword Cannot be Dodged! Defender looses 35 HP!')],
                })

                // Game Over
                return gameOver('🏆🛡️ Victory 🛡️🏆', attacker, defender, attacker, interaction, gameId);
            }

            await interaction.channel.send({
                content: '# Battle Decided! ✨',
                embeds: [EmbedMsg('Sword Cannot be Dodged! Defender looses 35 HP!')],
            })

        } else if(attackerChoice === 'bow' && defenderChoice === 'shield') {
            
            // Bow vs Shield
            // Defender looses 50 HP (Bow cannot be shielded)

            (defender.health -= 50) <= 0 ? defender.health = 0 : defender.health;

            if(defender.health <= 0) {

                await interaction.channel.send({
                    content: '# Battle Decided! ✨',
                    embeds: [EmbedMsg('Bow Cannot be Shielded! Defender looses 50 HP!')],
                })

                // Game Over
                return gameOver('🏆🛡️ Victory 🛡️🏆', attacker, defender, attacker, interaction, gameId);
            }

            await interaction.channel.send({
                content: '# Battle Decided! ✨',
                embeds: [EmbedMsg('Bow Cannot be Shielded! Defender looses 50 HP!')],
            })

        } else if(attackerChoice === 'bow' && defenderChoice === 'dodge') {
            
            // Bow vs Dodge
            // Attack is defended by the defender

            await interaction.channel.send({
                content: '# Battle Decided! ✨',
                embeds: [EmbedMsg('🛡️ Defended!')],
            })

        } else if(attackerChoice === 'potion' && defenderChoice === 'shield') {
            
            // Potion vs Shield
            // No effect on the defender

            attacker.potions -= 1;
            (attacker.health += 25) >= 100 ? attacker.health = 100 : attacker.health;

            await interaction.channel.send({
                content: '# Battle Decided! ✨',
                embeds: [EmbedMsg('Potion has no effect on Shield! Attacker gains 25 HP!')],
            })

        } else if(attackerChoice === 'potion' && defenderChoice === 'dodge') {
            
            // Potion vs Dodge
            // No effect on the defender

            attacker.potions -= 1;
            (attacker.health += 25) >= 100 ? attacker.health = 100 : attacker.health;

            await interaction.channel.send({
                content: '# Battle Decided! ✨',
                embeds: [EmbedMsg('Potion has no effect while Dodge! Attacker gains 25 HP!')],
            })
        } else if(attackerChoice === 'sword' && defenderChoice === 'potion') {
            
            // Sword vs Potion
            // Defender looses 35 HP also gained 25 HP for potion (Overall 10 HP loss)

            defender.potions -= 1;
            (defender.health -= 10) <= 0 ? defender.health = 0 : defender.health;

            if(defender.health <= 0) {

                await interaction.channel.send({
                    content: '# Battle Decided! ✨',
                    embeds: [EmbedMsg('Defender looses 10 HP!')],
                })

                // Game Over
                return gameOver('🏆🛡️ Victory 🛡️🏆', attacker, defender, attacker, interaction, gameId);
            }

            await interaction.channel.send({
                content: '# Battle Decided! ✨',
                embeds: [EmbedMsg('Defender looses 10 HP!')],
            })

        } else if(attackerChoice === 'bow' && defenderChoice === 'potion') {
            
            // Bow vs Potion
            // Defender looses 50 HP also gained 25 HP for potion (Overall 25 HP loss)

            defender.potions -= 1;
            (defender.health -= 25) <= 0 ? defender.health = 0 : defender.health;

            if(defender.health <= 0) {

                await interaction.channel.send({
                    content: '# Battle Decided! ✨',
                    embeds: [EmbedMsg('Defender looses 25 HP!')],
                })

                // Game Over
                return gameOver('🏆🛡️ Victory 🛡️🏆', attacker, defender, attacker, interaction, gameId);
            }

            await interaction.channel.send({
                content: '# Battle Decided! ✨',
                embeds: [EmbedMsg('Defender looses 25 HP!')],
            })

        } else if(attackerChoice === 'potion' && defenderChoice === 'potion') {
            
            // Potion vs Potion
            // Both players gain 25 HP

            attacker.potions -= 1;
            (attacker.health += 25) >= 100 ? attacker.health = 100 : attacker.health;

            defender.potions -= 1;
            (defender.health += 25) >= 100 ? defender.health = 100 : defender.health;

            await interaction.channel.send({
                content: '# Battle Decided! ✨',
                embeds: [EmbedMsg('Both players gain 25 HP!')],
            })

        }

        // Players changing their turns
        changeTurn(attacker, defender, interaction, gameId);

    } catch (err) {
        console.log('Error: ', err);
    }

}


// Change Turn function
const changeTurn = async (attacker, defender, interaction, gameId) => {

    try {

        let temp = attacker;
        attacker = defender;
        defender = temp;
        
        const embed = createEmbed(
            '🔄 Change Turn!',
            `**${attacker.user.username}** and **${defender.user.username}** has finished their turn!
            
            \n\`Attacker\`: ${attacker.user.username} - ${healthBar(attacker.health)} (${attacker.health} HP) - ${attacker.potions} Potions
            \n\`Defender\`: ${defender.user.username} - ${healthBar(defender.health)} (${defender.health} HP) - ${defender.potions} Potions`,
            PURPLE
        )

        await interaction.channel.send({
            content: 'Change Turn!',
            embeds: [embed],
            components: []
        })

        sendTurnMsg(attacker, defender, interaction, gameId);

    } catch (err) {
        console.log('Error: ', err);
    }

}


// Game Over function
const gameOver = async (msg, attacker, defender, winner, interaction, gameId) => {

    try {
        
        const gameOverMsg = createEmbed(
            msg,
            `**<@${winner.user.id}>** has won the game! 🎊🎉`,
            GOLD
        )

        // Sending player stats
        const embed = createEmbed(
            'Battle Decided! 🏆',
            `**${attacker.user.username}** and **${defender.user.username}** has finished their turn!
            
            \n ${attacker.user.username} - ${healthBar(attacker.health)} (${attacker.health} HP) - ${attacker.potions} Potions
            \n ${defender.user.username} - ${healthBar(defender.health)} (${defender.health} HP) - ${defender.potions} Potions`,
            PURPLE
        )

        await interaction.channel.send({
            content: 'Duel Ended!',
            embeds: [embed],
            components: []
        })


        // Deleting active game to clear up the memory
        activeGames.delete(gameId);

        // Sending Victory message
        return await interaction.followUp({
            content: '# Game Over!',
            embeds: [gameOverMsg],
            components: []
        })

    } catch (err) {
        console.log('Error: ', err);
    }

}


// Export the functions
module.exports = {
    startGame,
    healthBar
}