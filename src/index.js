import "./style.css";
import { params } from "./params.js";
import { domManip } from "./domManip.js";

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
    const singleplayerButton = document.querySelector(".singleplayer-button");
    singleplayerButton.addEventListener("click", () => domManip.changeScreen("character-select-screen"));

    // Display characters on char select screen and select top by default
    params.characters.forEach(char => domManip.displayCharIcon(char));
    const charIcons = Array.from(document.querySelectorAll(".charIcon"));
    charIcons.forEach(icon => icon.addEventListener("click", () => charIconClicked(icon)));
    charIconClicked(charIcons[0]);

    
}
init();








