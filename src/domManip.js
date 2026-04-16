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
        p1Grid.appendChild(p1Block);
        const p2Block = document.createElement("div");
        p2Block.setAttribute("data-block-num", i);
        p2Block.classList.add("grid-block");
        p2Grid.appendChild(p2Block);
    }
}

const selectShip = (event) => {
    if(event.target.classList.contains("ship-selected")) {
        event.target.classList.remove("ship-selected");
        params.game.selectedShipLen = 0;
        return;
    }
    const selectedShips = Array.from(document.querySelectorAll(".ship-selected"));
    selectedShips.forEach(ship => ship.classList.remove("ship-selected"));
    event.target.classList.add("ship-selected");
    params.game.selectedShipLen = event.target.dataset.length;
}

const hoverGridCell = (event) => {
    const len = +params.game.selectedShipLen;
    if(!event.target.classList.contains("grid-block") || len < 1) return
    let validPlacement = true;
    const shipBlocks = [];
    const blockNum = event.target.dataset.blockNum;
   if(params.game.placeHorizontal) {
        if((+blockNum + len - 1) % 10 < +blockNum % 10) validPlacement = false;
        let prev = 0;
        for(let i = +blockNum; i < +blockNum + +len && i % 10 >= prev; i++) {
            const block = document.querySelector(`[data-block-num="${i}"]`);
            if(block) shipBlocks.push(block);
            prev = i % 10;
        }  
    } else {
        if(+blockNum + (10 * (len - 1)) > 99) validPlacement = false;
        for(let i = +blockNum; i <= +blockNum + (10 * (len - 1)) && i < 99; i += 10) {
            const block = document.querySelector(`[data-block-num="${i}"]`);
            if(block) shipBlocks.push(block);         
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
        block.classList = "grid-block";
    })
}

const toggleCheckbox = (e) => {
    if(e.key === " " || e.key.toLowerCase() === "r") {
        e.preventDefault();
        console.log("run")
        checkbox.checked = !checkbox.checked;
        params.game.placeHorizontal = !checkbox.checked;
    }
}

const domManip = {changeScreen, displayCharIcon, displayCharInfo, setupGrids, selectShip,
    hoverGridCell, unhoverGridCell, toggleCheckbox
};
export {domManip};