import shrapnelIcon from "./images/shrapnel.png"
import yelenaIcon from "./images/yelena.png";
import aikawaIcon from "./images/aikawa.png";
import mobyDick from "./images/moby-dick.png";
import sonarBomb from "./images/sonar-bomb.png";
import gatlingCannon from "./images/gatling-cannon.png";
import shrapnelPortrait from "./images/shrapnel-portrait.png";
import yelenaPortrait from "./images/yelena-portrait.png";
import aikawaPortrait from "./images/aikawa-portrait.png";

import placeholder from "./images/placeholder.png";

class Ship {
    #size;
    #hits;
    #sunk;
    #horizontal;
    constructor(size, horizontal, type) {
        this.#size = size;
        this.#hits = 0;
        this.#sunk = false;
        this.#horizontal = horizontal;
        this.type = type;
    }

    getSize = () => this.#size;
    getHits = () => this.#hits;
    isHorizontal = () => this.#horizontal

    hit = () => {
        if(this.#hits < this.#size) {
            this.#hits++;
            this.isSunk();
        }
    } 

    isSunk = () => {
        if(this.#hits >= this.#size) {
            this.#sunk = true;
        }
        return this.#sunk;
    }

    rotate = () => {
        this.#horizontal = !this.#horizontal;
        return this.#horizontal;
    }
}

class Gameboard {
    #shipSpaces;
    constructor() {
        this.#shipSpaces = 0;
        this.board = this.setupBoard();
    }

    setupBoard = () => {
        let board = new Array(10);
        for(let i = 0; i < 10; i++) {
            const arr = new Array(10);
            board[i] = arr;
        }
        board.forEach(row => row.fill(null, 0, 10));
        return board
    }

    getShipSpaces = () => this.#shipSpaces;

    isValidPlacement = (size, horiz, x, y) => {
        // x and y mark the top left block of the ship
        if(horiz) {
            if((y + size - 1) > 9 || x > 9) return false;
            for(let i = y; i < y + size; i++) {
                if(this.board[x][i] !== null) return false;
            }
        } else {
            if(y > 9 || (x + size - 1) > 9) return false;
            for(let i = x; i < x + size; i++) {
                if(this.board[i][y] !== null) return false;
            }
        }
        return true
    }

    placeShip = (ship, x, y) => {
        // if(!this.isValidPlacement(ship.getSize(), ship.isHorizontal(), x, y)) return false;
        for(let i = 0; i < ship.getSize(); i++) {
            this.board[x][y] = ship;
            ship.isHorizontal() ? y++ : x++;
            this.#shipSpaces++;
        }
        return true;
    }

    receiveAttack = (x, y) => {
        if(this.board[x][y] === "O" || this.board[x][y] === "X") {
            return false;
        } else if(!this.board[x][y]) {
            this.board[x][y] = "X";
            return { x: x, y: y, wasHit: false, wasSunk: false };
        } else {
            this.board[x][y].hit();
            // this.board[x][y] = "O";
            this.#shipSpaces--;
            if(this.board[x][y].isSunk()) return { x: x, y: y, wasHit: true, wasSunk: true }
            else return { x: x, y: y, wasHit: true, wasSunk: false };
        }
    }

    makeRandomBoard = () => {
        const shipLens = [2, 3, 3, 4, 5];
        const shipOrients = [];
        const shipTypes = ["patrol", "submarine", "destroyer", "battleship", "carrier"];
        for(let i = 0; i < 5; i++) {
            shipOrients.push(Math.floor(Math.random() * 2))
        }
        for(let i = 0; i < 5; i++) {
            const ship = new Ship(shipLens.pop(), shipOrients.pop(), shipTypes.pop());
            while(true) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                if(this.isValidPlacement(ship.getSize(), ship.isHorizontal(), row, col)) {
                    this.placeShip(ship, row, col)
                    break;
                }
            }
        }
    }
}

class Player {
    constructor(realPlayer, character) {
        this.isRealPlayer = realPlayer;
        this.board = new Gameboard();
        this.character = character;
        this.charInfo = this.getCharInfo(character);
        this.abilityAvailable = true;
        this.abilityTurns = 0;
        this.abilityCancelable = true;
        this.aiInfo = {};
        if(!this.isRealPlayer) {
            const abilityUseTurn = Math.floor(Math.random() * 3 + 1);
            this.aiInfo.abilityUseTurn = abilityUseTurn;
            this.aiInfo.hitShips = [];
            this.aiInfo.revealedShips = [];
            this.aiInfo.revealedEmptySpaces = [];
        }
    }
    getCharInfo = (character) => {
        for(let char of characters) {
            if(char.id === character) {
                return char;
            }
        }
    }
    getDirectionedShips = () => {
        if(!this.aiInfo.hitShips) return null;
        let dirShip;
        for(let ship of this.aiInfo.hitShips) {
            if(ship.isHorizontal !== null) {
                dirShip = ship;
                break;
            }
        }
        if(!dirShip) return null;
        const dirShips = [];
        this.aiInfo.hitShips.forEach(ship => {
            if(ship.shipData.type === dirShip.shipData.type) dirShips.push(ship);
        });
        return dirShips.sort((a, b) => a.shipBlock.getAttribute("data-block-num") - b.shipBlock.getAttribute("data-block-num"));
    }
}

class Game {
    constructor(isSingleplayer) {
        this.p1 = null;
        this.p2 = null;
        this.turn = 0;
        this.isSingleplayer = isSingleplayer;
        this.selectedShipLen = 0;
        this.selectedShipType = null;
        this.isP1Turn = true;
        this.placeHorizontal = true;
    }

    getRandomP2 = () => {
        let randChar = characters[Math.floor(Math.random() * 3)];
        if (randChar.id !== this.p1.character) {
            this.p2 = new Player(false, randChar.id);
        } else this.getRandomP2();
    }
}

const characters = [
    {
        id: "shrapnel",
        name: "Captain Shrapnel",
        icon: shrapnelIcon,
        gadget: "Moby Dick",
        background: "Captain Reggie Shrapnel throws caution to the wind and faces his enemies head on through sheer power. Known as an outgoing and boisterous leader throughout the American navy, he rose quickly through the ranks thanks to his trust and love from his comrades, which is matched only by the fear from the enemy fleet seeing his boat on the horizon. Captian Shrapnel end his battles swiftly and triumphantly.",
        description: "Attacks every square in a 3x3 radius at the cost of losing your next turn to recharge.",
        characterPortrait: shrapnelPortrait,
        gadgetPortrait: mobyDick,
        lines: {
            waiting: "Don't just stand there with your hands in your pockets! Give me a target before I start shooting at the clouds for fun!",
            hit: "DIRECT HIT! Ha! Did you see the wood fly?! Keep 'em coming, boys, we’re just getting warmed up!",
            miss: "Aww, just a warning shot! I wanted to see them jump a little before we really let 'em have it! Realign and fire again!",
            sunk: "BOOM! Down to the locker they go! That’s how a real crew does it! Now on to the next!",
            gadget: "CLEAR THE DECK! It’s time for the big one! Once this baby goes off, I’m taking a well-deserved nap while you lot sweep up the pieces!",
            victory: "VICTORY! Look at that beautiful smoke! You’re the best crew a captain could ask for—now let’s find some more trouble!"
        }
    }, {
        id: "yelena",
        name: "Officer Yelena",
        icon: yelenaIcon,
        gadget: "Sonar Bombs",
        background: "As trusted by her subordinates as she is feared, Officer Yelena Kuznetsov has forged a flawless battle record through controlling information. She scarcely ever speaks aside from issuing precise and decisive orders. Touted as Russia's finest commanding officer, Yelena always makes sure she is one step ahead of her opponents with the newest cutting-edge tools.",
        description: "For your next 3 attacks, the 4 squares adjacent to where you attacked are revealed.",
        characterPortrait: yelenaPortrait,
        gadgetPortrait: sonarBomb,
        lines: {
            waiting: "Awaiting coordinates. Hesitation is a tactical liability.",
            hit: "Target struck. Maintaining pressure.",
            miss: "Recalibrate the cannons. We do not waste ammunition.",
            hit: "Enemy ship neutralized. Confirming next target.",
            gadget: "Sonar bombs ready. Data incoming—all units, prepare to engage.",
            victory: "Objective secured. Report to stations for post-action debrief."
        }
    }, {
        id: "aikawa",
        name: "Admiral Aikawa",
        icon: aikawaIcon,
        gadget: "Gatling Cannon",
        background: "Combining his sharp intuition cultivated through decades of battles with ingeniously engineered state of the art weaponry, Admiral Hayase Aikawa is a once-in-a-generation talent. Through sheer battle IQ, he precicely determines his enemy's position and ruthlessly mows them down. It is said that Aikawa has seen so much naval warfare that he's developed a sixth sense to read the waves.",
        description: "One tile containing an enemy ship is revealed. For your next 3 turns, if you hit an enemy ship, you can shoot again until you miss.",
        characterPortrait: aikawaPortrait,
        gadgetPortrait: gatlingCannon,
        lines: {
            waiting: "Patience. The sea always reveals an opening if you're willing to watch for it.",
            hit: "Exactly as anticipated. They’re right where I want them.",
            miss: "A minor deviation. Adjust the lead; their luck won't hold twice.",
            sunk: "Efficiently handled. One less variable to account for on the board.",
            gadget: "Prepare the gatling. While they're scrambling to recover, we'll ensure they never get the chance.",
            victory: "The outcome was never in doubt. Secure the perimeter and prepare to move out."
        }
    }
];

let game;
// delete below later, for debugging
game = new Game(true);
game.p1 = new Player(true, "shrapnel");
game.p2 = new Player(false, "aikawa");

const params = {Ship, Gameboard, Player, Game, characters, game};
export {params};