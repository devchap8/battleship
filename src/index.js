import "./style.css";
import { params } from "./params.js";
import { domManip } from "./domManip.js";


const singleplayerButton = document.querySelector(".singleplayer-button");
singleplayerButton.addEventListener("click", () => domManip.changeScreen("character-select-screen"));

params.characters.forEach(char => domManip.displayCharIcon(char));


// remove below later
const characterPortrait = document.querySelector(".character-portrait");
const gadgetPortrait = document.querySelector(".gadget-portrait");
import placeholder from "./images/shrapnel.png";
characterPortrait.src = placeholder;
gadgetPortrait.src = placeholder;

