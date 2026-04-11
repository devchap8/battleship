const screenList = Array.from(document.querySelectorAll(".screen"));

const changeScreen = (screenID) => {
    screenList.forEach(screen => {
        if(screen.classList.contains("active")) screen.classList.remove("active");
        if(screen.id === screenID) screen.classList.add("active")
    });
}





const domManip = {changeScreen};
export {domManip};