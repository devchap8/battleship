const screenList = Array.from(document.querySelectorAll(".screen"));
const characterSidebar = document.querySelector(".character-sidebar");

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
    characterSidebar.appendChild(icon);
}



const domManip = {changeScreen, displayCharIcon};
export {domManip};