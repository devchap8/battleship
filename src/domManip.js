const screenList = Array.from(document.querySelectorAll(".screen"));
const characterSidebar = document.querySelector(".character-sidebar");
const charPortrait = document.querySelector(".character-portrait");
const gadgetPortrait = document.querySelector(".gadget-portrait");
const charName = document.querySelector(".character-name");
const gadgetName = document.querySelector(".gadget-name");
const charDescription = document.querySelector(".character-description");
const gadgetDescription = document.querySelector(".gadget-description");

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



const domManip = {changeScreen, displayCharIcon, displayCharInfo};
export {domManip};