import "./style.css";
import { params } from "./params.js";
import { domManip } from "./domManip.js";

const startSinglePlayer = () => {
    params.game = new params.Game(true);
    domManip.changeScreen("character-select-screen");
}

const selectChar = () => {
    const char = document.querySelector(".selectedChar");
    const charID = char.getAttribute("character-id");
    const player = new params.Player(true, charID);
    if (params.game.p1 !== null) {
        params.game.p2 = player;
        domManip.changeScreen("game-screen");
    } else if (params.game.p1 === null && params.game.isSingleplayer) {
        params.game.p1 = player;
        params.game.getRandomP2();
        domManip.changeScreen("game-screen");
    } else {
        // game is 2p and player selected p1
        // remove selected char from sidebar and let p2 select
        // move screens
    }
}

const charIconClicked = (icon) => {
    const selectedChars = document.querySelectorAll(".selectedChar");
    if(selectedChars) Array.from(selectedChars).forEach(char => char.classList.remove("selectedChar"));
    icon.classList.add("selectedChar");
    let char;
    for(const c of params.characters) {
        if(c.id === icon.getAttribute("character-id")) {
            char = c;
            break;
        }
    }
    domManip.displayCharInfo(char);
}

const placeShip = (event) => {
    if(!event.target.classList.contains("grid-block")) return
    const shipBlocks = domManip.placeShipDom(event);
    if(!shipBlocks) return;
    let board;
    shipBlocks[0].classList.contains("p1-block") 
        ? board = params.game.p1.board
        : board = params.game.p2.board;
    const num = shipBlocks[0].getAttribute("data-block-num");
    const row = Math.floor(num / 10);
    const col = num % 10;
    const ship = new params.Ship(params.game.selectedShipLen, params.game.placeHorizontal, params.game.selectedShipType);
    board.placeShip(ship, row, col);
    params.game.selectedShipLen = 0;
}

const resetGrid = () => {
    let dataBoard;
    let domBoard;
    if(params.game.isP1Turn) {
        dataBoard = params.game.p1.board;
        domBoard = document.querySelector("#player-1-grid");
    } else {
        dataBoard = params.game.p2.board;
        domBoard = document.querySelector("#player-2-grid");
    }
    dataBoard.board = dataBoard.setupBoard();
    const cells = Array.from(domBoard.children);
    cells.forEach(cell => {
        cell.classList = "grid-block";
        params.game.isP1Turn ? cell.classList.add("p1-block") : cell.classList.add("p2-block");
    });
    const shipCards = Array.from(document.querySelectorAll(".ship-card"));
    shipCards.forEach(card => card.classList = "ship-card");
    params.game.selectedShipLen = 0;
    params.game.selectedShipType = null;
}

const readyButtonClicked = () => {
    console.log(params.game.p2.board.board);
    if(params.game.p1.board.getShipSpaces() < 17) return;
    if(!params.game.isSingleplayer && params.game.p1.board.getShipSpaces() < 17) return;
    // 3 cases:
        // 1 player
        // 2p, p1 clicked
        // 2p, p2 clicked
    if(params.game.isSingleplayer) {
        params.game.p2.board.makeRandomBoard();
    }
    domManip.startGameDom();
    addAttackEventListeners();
    params.game.isP1Turn = true;
}

const addAttackEventListeners = () => {
    const p1Grid = document.querySelector("#player-1-grid");
    const p2Grid = document.querySelector("#player-2-grid");
    p1Grid.addEventListener("click", attackSquare);
    p2Grid.addEventListener("click", attackSquare);
}
const attackSquare = (event) => {
    if(!event.target.classList.contains("grid-block")) return;
    const blockNum = event.target.getAttribute("data-block-num");
    const row = Math.floor(blockNum / 10);
    const col = blockNum % 10;
    let attackedPlayer, attackingPlayer;
    if(params.game.isP1Turn) {
        attackedPlayer = params.game.p2;
        attackingPlayer = params.game.p1;
    } else {
        attackedPlayer = params.game.p1;
        attackingPlayer = params.game.p2;
    }

    let aikawaHit;
    if(attackingPlayer.character === "shrapnel" && attackingPlayer.abilityTurns > 0) {
        shrapnelAttack(attackedPlayer, row, col);
    } else if(attackingPlayer.character === "yelena" && attackingPlayer.abilityTurns > 0) {
        yelenaAttack(attackedPlayer, row, col, event, attackingPlayer);
    } else {
        aikawaHit = normalAttack(attackedPlayer, row, col, event, attackingPlayer);
    }

    if(attackedPlayer.board.getShipSpaces() < 1) {
        params.game.isP1Turn ? gameWon(params.game.p1) : gameWon(params.game.p2);
    } else if(!aikawaHit) {
        newTurn();
    }
}

const normalAttack = (attackedPlayer, row, col, event, attackingPlayer) => {
    const hitInfo = attackedPlayer.board.receiveAttack(row, col);
    hitInfo.wasHit ? domManip.attackHit(event.target) : domManip.attackMiss(event.target);
    if( hitInfo.wasSunk) {
        const shipType  = attackedPlayer.board.board[row][col].type;
        domManip.sinkShip(shipType);
    } if(hitInfo.wasHit && attackingPlayer.character === "aikawa" && attackingPlayer.abilityTurns > 0) {
        return true;
    }
    return false;
}

const shrapnelAttack = (attackedPlayer, row, col) => {
    const dataCoords = [];
    const domNums = [];
    const domBlocks = [];
    const coordMods = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]];
    coordMods.forEach(mod => {
        if(row + mod[0] >= 0 && row + mod[0] <= 9 && col + mod[1] >= 0 && col + mod[1] <= 9) {
            dataCoords.push([row + mod[0], col + mod[1]]);
        }
    });
    dataCoords.forEach(coord => {
        domNums.push((coord[0] * 10) + coord[1]);
    });
    let receivingPlayer = "";
    params.game.isP1Turn ? receivingPlayer = "p2" : receivingPlayer = "p1";
    domNums.forEach(num => {
        const block = document.querySelector(`[data-block-num="${num}"].${receivingPlayer}-block`);
        domBlocks.push(block);
    });
    for(let i = 0; i < dataCoords.length; i++) {
        const hitInfo = attackedPlayer.board.receiveAttack(dataCoords[i][0], dataCoords[i][1]);
        hitInfo.wasHit ? domManip.attackHit(domBlocks[i]) : domManip.attackMiss(domBlocks[i]);
        if(hitInfo.wasSunk) {
            const shipType  = attackedPlayer.board.board[dataCoords[i][0]][dataCoords[i][1]].type;
            domManip.sinkShip(shipType);
        }
    }
}

const yelenaAttack = (attackedPlayer, row, col, event, attackingPlayer) => {
    console.log("yelena attack")
    normalAttack(attackedPlayer, row, col, event, attackingPlayer);
    const coords = [];
    const domNums = [];
    const domBlocks = [];
    const coordMods = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    coordMods.forEach(mod => {
        if(row + mod[0] >= 0 && row + mod[0] <= 9 && col + mod[1] >= 0 && col + mod[1] <= 9) {
            coords.push([row + mod[0], col + mod[1]]);
        }
    });
    coords.forEach(coord => {
        domNums.push((coord[0] * 10) + coord[1]);
    });
    let receivingPlayer = "";
    params.game.isP1Turn ? receivingPlayer = "p2" : receivingPlayer = "p1";
    domNums.forEach(num => {
        const block = document.querySelector(`[data-block-num="${num}"].${receivingPlayer}-block`);
        domBlocks.push(block);
    });
    for(let i = 0; i < coords.length; i++) {
        if(!domBlocks[i].classList.contains("attacked-hit") && !domBlocks[i].classList.contains("attacked-miss")
        && !domBlocks[i].classList.contains("attacked-sunk")) {
            revealBlock(attackedPlayer, domBlocks[i], coords[i]);
        }
    }
}

const revealBlock = (attackedPlayer, block, coords) => {
    if(attackedPlayer.board.board[coords[0]][coords[1]]) {
        domManip.revealHit(block);
    } else {
        domManip.revealMiss(block);
    }
}

const randomAttack = () => {
    const blockNum = Math.floor(Math.random() * 100);
    const block = document.querySelector(`#player-1-grid [data-block-num="${blockNum}"]`);
    if(block.classList.contains("attacked-hit") || block.classList.contains("attacked-miss") 
    || block.classList.contains("attacked-sunk")) {
        randomAttack();
        return;
    }
    setTimeout(() => {
        const row = Math.floor(blockNum / 10);
        const col = blockNum % 10;
        const hitInfo = params.game.p1.board.receiveAttack(row, col);
        hitInfo.wasHit ? domManip.attackHit(block) : domManip.attackMiss(block);
        if( hitInfo.wasSunk) {
            const shipType  = params.game.p1.board.board[row][col].type;
            domManip.sinkShip(shipType);
        }
        if(params.game.p1.board.getShipSpaces() < 1) {
            gameWon(params.game.p2);
        } else {
            newTurn();
        }   
    }, 0);
// ^^^ Increase delay to 500ms after testing is done
}

const newTurn = () => {
    params.game.isP1Turn = !params.game.isP1Turn;
    params.game.turn++;
    let currPlayer;
    params.game.isP1Turn ? currPlayer = params.game.p1 : currPlayer = params.game.p2;
    if(currPlayer.isRealPlayer) domManip.newTurnAbilityIconCheck(currPlayer);
    // skip shrapnel turn after ability used
    if(currPlayer.character === "shrapnel" && currPlayer.abilityTurns > 0) {
        setTimeout(() => {
            currPlayer.abilityTurns--;
            currPlayer.abilityCancelable = false;
            currPlayer.abilityAvailable = false;
            // display shrapnel dialogue
            newTurn();
        }, 1000)
    } else if((currPlayer.character === "yelena" || currPlayer.character === "aikawa") 
    && currPlayer.abilityTurns > 0) {
        currPlayer.abilityTurns--;
        currPlayer.abilityCancelable = false;
        currPlayer.abilityAvailable = false;
    }
    else if(params.game.isSingleplayer && !currPlayer.isRealPlayer) {
        randomAttack();
    } 
}

const gameWon = (player) => {
    alert(`${player.character} Wins!`)
}

const gadgetIconClicked = () => {
    let player;
    params.game.isP1Turn ? player = params.game.p1 : player = params.game.p2;
    if(!player.abilityAvailable) return;
    domManip.toggleAbilityActive();
    if(player.abilityTurns > 0 && player.abilityCancelable) {
        cancelGadget(player);
    } else {
        useGadget(player);
    }
}

const useGadget = (player) => {
    if(player.character === "shrapnel") {
        player.abilityTurns = 1;
    } else {
        player.abilityTurns = 3;
    }  
}

const cancelGadget = (player) => {
    // if(player.character === "shrapnel" && player.abilityAvailable === true) {
    //     player.abilityTurns = 0;
    // } else if(player.character === "yelena") {
    //     // yelena gadget reverse fn
    // } else {
    //     // aikawa gadget reverse fn
    // }
    if(player.abilityAvailable === true) {
        player.abilityTurns = 0;
    }
}

const init = () => {
    // setup single player button event listener
    const singleplayerButton = document.querySelector(".singleplayer-button");
    singleplayerButton.addEventListener("click", startSinglePlayer);

    // setup select character event listener
    const selectCharButton = document.querySelector(".select-character-button");
    selectCharButton.addEventListener("click", selectChar);

    // Display characters on char select screen and select top by default
    params.characters.forEach(char => domManip.displayCharIcon(char));
    const charIcons = Array.from(document.querySelectorAll(".charIcon"));
    charIcons.forEach(icon => icon.addEventListener("click", () => charIconClicked(icon)));
    charIconClicked(charIcons[0]);

    domManip.setupGrids();

    // setup ship selection fn
    const shipCards = Array.from(document.querySelectorAll(".ship-card"));
    shipCards.forEach(card => card.addEventListener("click", domManip.selectShip))

    // setup ship placing hover
    const battlefieldContainer = document.querySelector(".battlefield-container");
    battlefieldContainer.addEventListener("mouseover", domManip.hoverGridCell);
    battlefieldContainer.addEventListener("mouseout", domManip.unhoverGridCell);

    // toggle horiz vert slider with keyboard
    const checkbox = document.querySelector("#rotation-slider");
    window.addEventListener("keydown", domManip.toggleCheckbox);
    checkbox.addEventListener("change", () => params.game.placeHorizontal = !checkbox.checked);

    // place ships
    battlefieldContainer.addEventListener("click", placeShip);

    // board setup reset button
    const resetGridButton = document.querySelector(".reset-grid-button");
    resetGridButton.addEventListener("click", resetGrid);

    // ready button
    const readyButton = document.querySelector(".ready-button");
    readyButton.addEventListener("click", readyButtonClicked);

    // gadget icon
    const abilityIcon = document.querySelector(".ability-icon");
    abilityIcon.addEventListener("click", gadgetIconClicked);
}
init();








