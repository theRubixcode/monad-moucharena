// Description: This file contains the pendingGames and activeGames maps. These maps are used to store the games that are currently running. The pendingGames map stores the games that are waiting for a second player to join. The activeGames map stores the games that are currently being played. The keys of the maps are the game IDs and the values are the game objects. The game objects contain the game state, the players, and the game ID. The game state is an object that contains the board, the turn, and the winner. The players are an array that contains the player IDs. The game ID is a string that is generated using the shortid library.

// Pending Games storage map
const pendingGames = new Map();

// Active Games storage map
const activeGames = new Map();

module.exports = {
    pendingGames,
    activeGames
}