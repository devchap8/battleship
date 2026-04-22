import { params } from "./params.js";

const screenList = Array.from(document.querySelectorAll(".screen"));
const characterSidebar = document.querySelector(".character-sidebar");
const charPortrait = document.querySelector(".character-portrait");
const gadgetPortrait = document.querySelector(".gadget-portrait");
const charName = document.querySelector(".character-name");
const gadgetName = document.querySelector(".gadget-name");
const charDescription = document.querySelector(".character-description");
const gadgetDescription = document.querySelector(".gadget-description");
const p1Grid = document.querySelector("#player-1-grid");
const p2Grid = document.querySelector("#player-2-grid");
const checkbox = document.querySelector("#rotation-slider");
const setupControls = document.querySelector("#setup-controls");
const dialogueInterface = document.querySelector("#dialogue-interface");
const abilityContainer = document.querySelector(".ability-container");
const phaseTitle = document.querySelector("#phase-title");
const phaseSubtitle = document.querySelector("#phase-subtitle");
const abilityIcon = document.querySelector(".ability-icon > img");
const abilityBox = document.querySelector(".ability-icon");
const dialoguePortrait = document.querySelector(".dialogue-portrait > img");
const speakerName = document.querySelector(".speaker-name");

const changeScreen = (screenID) => {
    screenList.forEach(screen => {
        if(screen.classList.contains("active")) screen.classList.remove("active");
        if(screen.id === screenID) screen.classList.add("active")
    });
}

const displayCharIcon = (char) => {
    const icon = document.createElement("img");
    icon.setAttribute("src", char.icon);
    icon.setAttribute("alt", char.name);
    icon.setAttribute("character-id", char.id);
    icon.classList.add("charIcon");
    characterSidebar.appendChild(icon);
}

const displayCharInfo = (char) => {
    charPortrait.setAttribute("src", char.characterPortrait);
    charPortrait.setAttribute("alt", char.name);
    gadgetPortrait.setAttribute("src", char.gadgetPortrait);
    gadgetPortrait.setAttribute("alt", char.gadget);
    charName.innerHTML = char.name.toUpperCase();
    gadgetName.innerHTML = char.gadget.toUpperCase();
    charDescription.innerHTML = char.background;
    gadgetDescription.innerHTML = char.description;
}

const setupGrids = () => {
    for (let i = 0; i < 100; i++) {
        const p1Block = document.createElement("div");
        p1Block.setAttribute("data-block-num", i);
        p1Block.classList.add("grid-block");
        p1Block.classList.add("p1-block")
        p1Grid.appendChild(p1Block);
        const p2Block = document.createElement("div");
        p2Block.setAttribute("data-block-num", i);
        p2Block.classList.add("grid-block");
        p2Block.classList.add("p2-block")
        p2Grid.appendChild(p2Block);
    }
}

const selectShip = (event) => {
    if(event.target.classList.contains("ship-selected")) {
        event.target.classList.remove("ship-selected");
        params.game.selectedShipLen = 0;
        params.game.selectedShipType = null;
        return;
    }
    const selectedShips = Array.from(document.querySelectorAll(".ship-selected"));
    selectedShips.forEach(ship => ship.classList.remove("ship-selected"));
    event.target.classList.add("ship-selected");
    params.game.selectedShipLen = event.target.dataset.length;
    params.game.selectedShipType = event.target.dataset.ship;
}

const hoverGridCell = (event) => {
    const len = +params.game.selectedShipLen;
    if(!event.target.classList.contains("grid-block") || len < 1) return;
    let currPlayer = "";
    params.game.isP1Turn ? currPlayer = "p1" : currPlayer = "p2";
    if(currPlayer == "p1" && event.target.parentElement.id === "player-2-grid") return;
    else if(currPlayer == "p2" && event.target.parentElement.id === "player-1-grid") return;
    let validPlacement = true;
    const shipBlocks = [];
    const blockNum = event.target.dataset.blockNum;
   if(params.game.placeHorizontal) {
        if((+blockNum + len - 1) % 10 < +blockNum % 10) validPlacement = false;
        let prev = 0;
        for(let i = +blockNum; i < +blockNum + +len && i % 10 >= prev; i++) {
            const block = document.querySelector(`[data-block-num="${i}"].${currPlayer}-block`);
            if(block) shipBlocks.push(block);
            prev = i % 10;
        }  
    } else {
        if(+blockNum + (10 * (len - 1)) > 99) validPlacement = false;
        for(let i = +blockNum; i <= +blockNum + (10 * (len - 1)) && i <= 99; i += 10) {
            const block = document.querySelector(`[data-block-num="${i}"].${currPlayer}-block`);
            if(block) shipBlocks.push(block);         
        }
    }
    for(let block of shipBlocks) {
        if(block.classList.contains("occupied-block")) {
            validPlacement = false;
            break;
        }
    }
    validPlacement
        ? shipBlocks.forEach(block => block.classList.add("hover-valid"))
        : shipBlocks.forEach(block => block.classList.add("hover-invalid"))
}

const unhoverGridCell = (event) => {
    if(!event.target.classList.contains("grid-block")) return
    let hovered = Array.from(document.querySelectorAll(".hover-valid"));
    hovered = hovered.concat(Array.from(document.querySelectorAll(".hover-invalid")));
    hovered.forEach(block => {
        if(block.classList.contains("hover-valid")) block.classList.remove("hover-valid");
        if(block.classList.contains("hover-invalid")) block.classList.remove("hover-invalid");
    })
}

const toggleCheckbox = (e) => {
    if(e.key === " " || e.key.toLowerCase() === "r") {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        params.game.placeHorizontal = !checkbox.checked;
    }
}

const placeShipDom = (event) => {
    const validBlocks = Array.from(document.querySelectorAll(".hover-valid"));
    if(validBlocks.length < 1) return;
    for(let block of validBlocks) {
        block.classList.remove("hover-valid");
        block.classList.add("occupied-block");
    }
    const selectedShip = document.querySelector(".ship-selected");
    selectedShip.classList.remove("ship-selected");
    selectedShip.classList.add("card-placed");
    return validBlocks;
}

const startGameDom = () => {
    setupControls.classList.add("hidden");
    dialogueInterface.classList.remove("hidden");
    abilityContainer.classList.remove("hidden");
    phaseTitle.innerHTML = "PLAYER 1's TURN";
    phaseSubtitle.innerHTML = "Attack an enemy square";
    showPlayerGameInfo(params.game.p1);
    p1Grid.classList.add("inactive-board");
    p2Grid.classList.add("active-board");
}

const showPlayerGameInfo = (player) => {
    abilityIcon.setAttribute("src", player.charInfo.gadgetPortrait);
    dialoguePortrait.setAttribute("src", player.charInfo.icon);
    speakerName.innerHTML = player.charInfo.name;
}

const attackHit = (block) => {
    block.classList.add("attacked-hit");
    block.innerHTML = "O";
}

const attackMiss = (block) => {
    block.classList.add("attacked-miss");
    block.innerHTML = "X";
}

const sinkShip = (shipType) => {
    let domBoard;
    let dataBoard;
    if(params.game.isP1Turn) {
        domBoard = p2Grid;
        dataBoard = params.game.p2.board.board;
    } else {
        domBoard = p1Grid;
        dataBoard = params.game.p1.board.board;
    }
    const shipPositions = [];
    for(let i = 0; i < dataBoard.length; i++) {
        for(let j = 0; j < dataBoard.length; j++) {
            if(typeof dataBoard[i][j] === "object" && dataBoard[i][j] !== null && dataBoard[i][j].type === shipType) {
                shipPositions.push((i * 10) + j);
            }
        }
    }
    const domBlocks = [];
    for(let pos of shipPositions) {
        domBlocks.push(domBoard.querySelector(`[data-block-num="${pos}"]`));
    }
    console.log(domBlocks);
    for(let block of domBlocks) {
        block.innerHTML = "#";
        block.classList.add("attacked-sunk");
    }
}

const toggleAbilityActive = () => {
    console.log("toggle");
    abilityBox.classList.contains("ability-active")
        ? abilityBox.classList.remove("ability-active")
        : abilityBox.classList.add("ability-active");
}

const domManip = {changeScreen, displayCharIcon, displayCharInfo, setupGrids, selectShip,
    hoverGridCell, unhoverGridCell, toggleCheckbox, placeShipDom, startGameDom, attackHit,
    attackMiss, sinkShip, toggleAbilityActive
};
export {domManip};