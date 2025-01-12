const { EmbedBuilder, ActionRowBuilder } = require("discord.js")
const {activeGames} = require('./runningGames');

// Game Constants
const maxHealth = 100
const swordDamage = 20
const bowDamage = 15
const shieldBlock = 10
const potionHeal = 25
const maxPotions = 3
const duelAcceptTimeout = 30 * 1000 // 30 seconds
const turnTimeout = 45 * 1000 // 45 seconds
const turnWarning = 30 * 1000 // 30 seconds

// Color Constants
const BLUE = '#2081DB'
const GREEN = '#43B581'
const RED = '#F04747'
const PURPLE = '#836FF8'
const CYAN = '#00FFFF'
const WHITE = '#FFFFFF'
const BLACK = '#000000'
const GRAY = '#808080'
const DARK_GRAY = '#404040'
const GOLD = '#FFD700'


// Embed creator helper function
function createEmbed(title, description, color) {
    return new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);
}

// Action row creator helper function
function createActionRow(buttons) { 
    return new ActionRowBuilder().addComponents(buttons);
}

// Start turn timer
function startTurnTimer(gameId, interaction) {
    const game = activeGames.get(gameId);
    if (!game) return;

    setTimeout(() => {
        if (activeGames.has(gameId)) {
            const currentTurn = game.turn;
            game.turn = currentTurn === game.challenger.user.id ? game.challenged.user.id : game.challenger.user.id;

            interaction.reply(
                `${currentTurn === game.challenger.user.id ? game.challenged.user.username : game.challenger.user.username}, it's your turn!`
            );

            startTurnTimer(gameId, interaction);
        }
    }, turnTimeout);
}


module.exports = {
    maxHealth,
    swordDamage,
    bowDamage,
    shieldBlock,
    potionHeal,
    maxPotions,
    duelAcceptTimeout, // 30 seconds
    turnTimeout, // 45 seconds
    turnWarning, // 30 seconds
    BLUE,
    GREEN,
    RED,
    PURPLE,
    CYAN,
    WHITE,
    BLACK,
    GRAY,
    DARK_GRAY,
    GOLD,
    createEmbed,
    createActionRow,
    startTurnTimer
}