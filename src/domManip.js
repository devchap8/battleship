const screenList = Array.from(document.querySelectorAll(".screen"));

const changeScreen = (screenID) => {
    // screenID = "character-select-screen";
    console.log("test")
    // remove later ^^^
    screenList.forEach(screen => {
        if(screen.classList.contains("active")) screen.classList.remove("active");
        if(screen.id === screenID) screen.classList.add("active")
    });
}



const domManip = {changeScreen};
export {domManip};