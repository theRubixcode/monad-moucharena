
# Mouch Arena (Discord Duel Bot)

Gmouch 💜,

## ⚔ What is Mouch Arena ?
A simple pvp game of rock paper scissors medieval style.

## 👁 Vision
It's a fun game where you can duel anyone in the discord server and compete. I would be cool to make it fully part of the Monad discord. This game can be more popular and more fun than rumble. 

## 🛠 How it works ?
One player can challenge another using the `/duel @playername` function.

The first player to attack is random

Each player has 100 life points, represented by a life bar.

The attacker has a window displayed for him/her, allowing him/her to choose between 3 buttons: sword, arrow, potion. The choice is made by clicking on an emoji button.

The sword does 35 damage, the arrow 50 damage and the potion (which can only be used 3 times) heals 25 health points and does no damage.

During this time, the defender is shown a window in which he can choose how to defend himself: shield or dodge. The choice is made by clicking on a button with an emoji.

If the attacker chooses sword and the defender chooses shield. Then the sword is blocked.

If the attacker chooses arrow and the defender chooses dodge. The arrow is dodged.

If the attacker chooses sword and the defender chooses dodge. The defender loses 35 hit points (the sword cannot be dodged).

If the attacker chooses arrow and the defender chooses shield. The defender loses 50 hit points (the arrow cannot be blocked by the shield).

The attacker changes each turn.

The result of each turn is displayed in a bot message, which also displays the players' remaining hit points.
The first player whose hit points reach 0 loses.

---

# Dev Notes

## How to run the program into your localhost?
- Copy the link of the repo
- Open the terminal of your desktop/laptop
- Navigate to designated folder
- Run the command:
`git clone <repository link>`

## Folders structure
```
.
├── commands                        # All command files are grouped here
│   └── games                       # Games folder to group all game related command files 
│       └── duel.js                 (We can make more group for different command files)
├── configs                         # Config folder
│   └── token.config.js
├── deploy                          # Command API deploy
│   └── deploy-commands.js
├── events                          # Discord bot events
│   ├── buttonInteraction.js
│   ├── interaction.js
│   └── ready.js
├── helper                          # Helper functions and mapping
│   ├── constants.js
│   ├── game.js
│   └── runningGames.js
├── node_modules                    # Node modules
├── .env
├── .eslintrc.json
├── .gitignore
├── index.js                        # Main Entry file for the bot
├── package-lock.json
└── package.json
```


## How to contribute?
The steps are simple:
- Clone the repo
- Create a new git branch
- Fix any bug or add an interesting features
- Open a pull request
- Say `Gmonad` or `Gmouch`

## Contributors

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://x.com/0xGleader" target="_blank">
          <img src="https://pbs.twimg.com/profile_images/1875635481108492289/FIienwjS_400x400.jpg" alt="User 1" style="border-radius: 50%; width: 150px; height: 150px; margin: 10px; border: 4px solid #836FF8;">
        </a>
        <h3 style="font-size: 24px; margin: 10px 0; text-decoration: none;">Gleader</h3>
      </td>
      <td align="center">
        <a href="https://x.com/rubixcode_" target="_blank">
          <img src="https://pbs.twimg.com/profile_images/1859447152096813056/0cs66Qp7_400x400.jpg" alt="User 2" style="border-radius: 50%; width: 150px; height: 150px; margin: 10px; border: 4px solid #9167f5;">
        </a>
        <h3 style="font-size: 24px; margin: 10px 0; text-decoration: none;">Rubixcode</h3>
      </td>
      <td align="center">
        <a href="https://x.com/port_dev" target="_blank">
          <img src="https://pbs.twimg.com/profile_images/1652909540461912064/WEIE2q8H_400x400.png" alt="User 3" style="border-radius: 50%; width: 150px; height: 150px; margin: 10px; border: 4px solid #9b67f5;">
        </a>
        <h3 style="font-size: 24px; margin: 10px 0; text-decoration: none;">Port</h3>
      </td>
    </tr>
  </table>
</div>
