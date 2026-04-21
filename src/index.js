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
    let character;
    for (let c of params.characters) {
        if(c.id === charID) {
            character = c;
            break;
        }
    }
    const player = new params.Player(true, character);
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
    let attackedPlayer;
    params.game.isP1Turn ? attackedPlayer = params.game.p2 : attackedPlayer = params.game.p1;
    const hitInfo = attackedPlayer.board.receiveAttack(row, col);
    hitInfo.wasHit ? domManip.attackHit(event.target) : domManip.attackMiss(event.target);
    if( hitInfo.wasSunk) {
        const shipType  = attackedPlayer.board.board[row][col].type;
        domManip.sinkShip(shipType);

    }
    // console.log(params.game.p2.board.getShipSpaces());
    if(attackedPlayer.board.getShipSpaces() < 1) {
        params.game.isP1Turn ? gameWon(params.game.p1) : gameWon(params.game.p2);
    } else {
        newTurn();
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
        newTurn;
    }
}

const newTurn = () => {
    params.game.isP1Turn = !params.game.isP1Turn;
    params.game.turn++;
    if(params.game.isSingleplayer) {
        randomAttack();
        params.game.turn++;
        params.game.isP1Turn = !params.game.isP1Turn;
    } 
}

const gameWon = (player) => {
    alert(`${player.character} Wins!`)
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
}
init();








