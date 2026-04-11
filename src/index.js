import "./style.css";
import { params } from "./params.js";
import { domManip } from "./domManip.js";


const singleplayerButton = document.querySelector(".singleplayer-button");
singleplayerButton.addEventListener("click", () => domManip.changeScreen("character-select-screen"));

params.characters.forEach(char => domManip.displayCharIcon(char));

