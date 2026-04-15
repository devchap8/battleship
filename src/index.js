import "./style.css";
import { params } from "./params.js";
import { domManip } from "./domManip.js";

let game;

const startSinglePlayer = () => {
    game = new params.Game(true);
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
    if (game.p1 !== null) {
        game.p2 = player;
        domManip.changeScreen("game-screen");
    } else if (game.p1 === null && game.isSingleplayer) {
        game.p1 = player;
        game.getRandomP2();
        domManip.changeScreen("game-screen");
    } else {
        // game is 2p and player selected p1
        // remove selected char from sidebar and let p2 select
        // move screens
    }
    console.log(game);
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

    
}
init();








