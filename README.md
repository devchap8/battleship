# Battleship
A modern web-based implementation of the board game Battleship using a hero system where players choose between 3 commanders with differing abilities.

## Features
Character selection: Select one of three 3 characters with a unique ability, portrait, and character lines
Abilities:
    Captain Shrapnel: 3x3 Square AOE strike that requires a recharge turn
    Officer Yelena: Sonar bombs which reveal adjacent tiles
    Admiral Aikawa: Gatling cannon that can chain multiple attacks
Singleplayer vs. AI and Local multiplayer with "Pass and Play" screen transition
Smart AI: Computer tracks hits, determines ship orientation, and uses abilities

## Tech Stack
Vanilla JavaScript
CSS3
HTML5

## How to Play
Setup:
    Run the project through the Github Pages deployment.
    Select Singleplayer or 2 Player.
    Choose your character. Their gadgets are described on the select screen.
Ship Deployment:
    Select a ship card from the bar on the bottom.
    You can rotate the ships by clicking the slider in the bottom left or by pressing "R" or Space.
    Place all 5 ships on your grid and press the ready button.
Gameplay:
    Click a coordinate on the enemy grid to fire.
    Click the ability icon in the top right to ready your ability. This can be cancelled by clicking again.
    Hit all 17 occupied squares on the enemy board to win.