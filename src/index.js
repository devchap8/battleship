import "./style.css";
import { params } from "./params.js";
import { domManip } from "./domManip.js";

const startSinglePlayer = () => {
    params.game = new params.Game(true);
    domManip.changeScreen("character-select-screen");
}

const startTwoPlayer = () => {
    params.game = new params.Game(false);
    domManip.changeScreen("character-select-screen");
}

const selectChar = () => {
    const char = document.querySelector(".selectedChar");
    const charID = char.getAttribute("character-id");
    const player = new params.Player(true, charID);
    if (params.game.p1 !== null) {
        // game is 2 player and p2 selects character
        params.game.p2 = player;
        domManip.changeScreen("game-screen");
        document.querySelector(".hidden-char-icon").classList.remove("hidden-char-icon");
        console.log(params.game);
    } else if(params.game.p1 == null && !params.game.isSingleplayer) {
        // game is 2p, p1 selects character
        char.classList.remove("selectedChar");
        char.classList.add("hidden-char-icon");
        params.game.p1 = player;
        autoSelectNewIcon();
    } else if (params.game.p1 === null && params.game.isSingleplayer) {
        // game is 1p, p1 selects char, select random char for bot
        params.game.p1 = player;
        params.game.getRandomP2();
        domManip.changeScreen("game-screen");
    } 
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

const autoSelectNewIcon = () => {
    const shrapnelIcon = document.querySelector('[character-id="shrapnel"]');
    const yelenaIcon = document.querySelector('[character-id="yelena"]');
    shrapnelIcon.classList.contains("hidden-char-icon")
        ? charIconClicked(yelenaIcon)
        : charIconClicked(shrapnelIcon);
}

const placeShip = (event) => {
    if(!event.target.classList.contains("grid-block")) return
    const shipBlocks = domManip.placeShipDom(event);
    if(!shipBlocks) return;
    let board;
    shipBlocks[0].classList.contains("p1-block") 
        ? board = params.game.p1.board
        : board = params.game.p2.board;
    const num = shipBlocks[0].getAttribute("data-block-num");
    const row = Math.floor(num / 10);
    const col = num % 10;
    const ship = new params.Ship(params.game.selectedShipLen, params.game.placeHorizontal, params.game.selectedShipType);
    board.placeShip(ship, row, col);
    params.game.selectedShipLen = 0;
}

const resetGrid = () => {
    let dataBoard;
    let domBoard;
    if(params.game.isP1Turn) {
        dataBoard = params.game.p1.board;
        domBoard = document.querySelector("#player-1-grid");
    } else {
        dataBoard = params.game.p2.board;
        domBoard = document.querySelector("#player-2-grid");
    }
    dataBoard.board = dataBoard.setupBoard();
    const cells = Array.from(domBoard.children);
    cells.forEach(cell => {
        cell.classList = "grid-block";
        params.game.isP1Turn ? cell.classList.add("p1-block") : cell.classList.add("p2-block");
    });
    const shipCards = Array.from(document.querySelectorAll(".ship-card"));
    shipCards.forEach(card => card.classList = "ship-card");
    params.game.selectedShipLen = 0;
    params.game.selectedShipType = null;
}

const readyButtonClicked = () => {
    if(params.game.p1.board.getShipSpaces() < 17) return;
    if(!params.game.isSingleplayer && params.game.p1.board.getShipSpaces() < 17) return;
    if(params.game.isSingleplayer) {
        params.game.p2.board.makeRandomBoard();
        startGame();
    } else if(params.game.p2.board.getShipSpaces() < 1) { // 2p, player 1 ready
        domManip.changeScreen("pass-screen");
        params.game.isP1Turn = false;
        domManip.toggleHiddenShipBlocks();
        domManip.reactivateShipCards();
        params.game.selectedShipLen = 0;

    } else if(params.game.p2.board.getShipSpaces() >= 17) { // 2p, player 2 ready
        domManip.changeScreen("pass-screen");
        setTimeout(() => {
            startGame();
        }, 500);
    }
}

const startGame = () => {
    domManip.startGameDom();
    addAttackEventListeners();
    params.game.isP1Turn = true;
    domManip.toggleHiddenShipBlocks();
    console.log(params.game);
}

const addAttackEventListeners = () => {
    const p1Grid = document.querySelector("#player-1-grid");
    const p2Grid = document.querySelector("#player-2-grid");
    p1Grid.addEventListener("click", attackSquare);
    p2Grid.addEventListener("click", attackSquare);
}
const attackSquare = (event) => {
    if(!event.target.classList.contains("grid-block")) return;
    attackSquareUniversal(event.target);
}

const attackSquareUniversal = (target) => {
    const blockNum = target.getAttribute("data-block-num");
    const row = Math.floor(blockNum / 10);
    const col = blockNum % 10;
    let attackedPlayer, attackingPlayer, block;
    if(params.game.isP1Turn) {
        attackedPlayer = params.game.p2;
        attackingPlayer = params.game.p1;
        block = document.querySelector(`[data-block-num="${blockNum}"].p2-block`);
    } else {
        attackedPlayer = params.game.p1;
        attackingPlayer = params.game.p2;
        block = document.querySelector(`[data-block-num="${blockNum}"].p1-block`);
    }

    let aikawaHit;
    if(attackingPlayer.character === "shrapnel" && attackingPlayer.abilityTurns > 0 && attackingPlayer.abilityAvailable) {
        shrapnelAttack(attackedPlayer, row, col);
    } else if(attackingPlayer.character === "yelena" && attackingPlayer.abilityTurns > 0) {
        yelenaAttack(attackedPlayer, row, col, block, attackingPlayer);
    } else {
        aikawaHit = normalAttack(attackedPlayer, row, col, block, attackingPlayer);
    }
    console.log(attackedPlayer);
    if(attackedPlayer.board.getShipSpaces() < 1) {
        params.game.isP1Turn ? gameWon(params.game.p1) : gameWon(params.game.p2);
    } else if(!aikawaHit) {
        if(params.game.isSingleplayer) newTurn();
        else if(attackedPlayer.character === "shrapnel" && attackedPlayer.abilityTurns > 0) {
            attackedPlayer.abilityTurns--;
        }
        // dont transition screen if shrapnel is recharging
        else  {
            passScreenTransition();
        } 
    } else if(aikawaHit && !attackingPlayer.isRealPlayer && attackingPlayer.abilityTurns > 0) {
        setTimeout(() => {computerEnemyLogic()}, 1000);
    }
 }

const normalAttack = (attackedPlayer, row, col, hitBlock, attackingPlayer) => {
    const hitInfo = attackedPlayer.board.receiveAttack(row, col);
    if(hitInfo.wasHit) {
        domManip.attackHit(hitBlock);
        if(!attackingPlayer.isRealPlayer) {
            const hitShip = {shipBlock: hitBlock, shipData: null, isHorizontal: null, adjacentHittable: true};
            hitShip.shipData = shipDataFromDom(hitBlock, attackedPlayer);
            attackingPlayer.aiInfo.hitShips.push(hitShip);
            if(attackingPlayer.aiInfo.hitShips.length > 1) checkHitShipOrientation(hitShip);
        }
    } else {    
        domManip.attackMiss(hitBlock);
    }
    if( hitInfo.wasSunk) {
        const shipType  = attackedPlayer.board.board[row][col].type;
        domManip.sinkShip(shipType);
        if(!params.game.isP1Turn && !params.game.p2.isRealPlayer) untrackHitShip(shipType);
    } if(hitInfo.wasHit && attackingPlayer.character === "aikawa" && attackingPlayer.abilityTurns > 0) {
        return true;
    }
    return false;
}

const shrapnelAttack = (attackedPlayer, row, col) => {
    console.log("shrapnel attack");
    const dataCoords = [];
    const domNums = [];
    const domBlocks = [];
    const coordMods = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]];
    coordMods.forEach(mod => {
        if(row + mod[0] >= 0 && row + mod[0] <= 9 && col + mod[1] >= 0 && col + mod[1] <= 9) {
            dataCoords.push([row + mod[0], col + mod[1]]);
        }
    });
    dataCoords.forEach(coord => {
        domNums.push((coord[0] * 10) + coord[1]);
    });
    let receivingPlayer = "";
    params.game.isP1Turn ? receivingPlayer = "p2" : receivingPlayer = "p1";
    domNums.forEach(num => {
        const block = document.querySelector(`[data-block-num="${num}"].${receivingPlayer}-block`);
        domBlocks.push(block);
    });
    for(let i = 0; i < dataCoords.length; i++) {
        const hitInfo = attackedPlayer.board.receiveAttack(dataCoords[i][0], dataCoords[i][1]);
        if(hitInfo.wasHit) {
            domManip.attackHit(domBlocks[i]);
            if(!params.game.isP1Turn && !params.game.p2.isRealPlayer) {
                const hitShip = {shipBlock: domBlocks[i], shipData: null, isHorizontal: null, adjacentHittable: true};
                hitShip.shipData = shipDataFromDom(domBlocks[i], params.game.p1);
                params.game.p2.aiInfo.hitShips.push(hitShip);
                if (params.game.p2.aiInfo.hitShips.length > 1) checkHitShipOrientation(hitShip);
            }
        } else {
            domManip.attackMiss(domBlocks[i]);
        }
        if(hitInfo.wasSunk) {
            const shipType  = attackedPlayer.board.board[dataCoords[i][0]][dataCoords[i][1]].type;
            domManip.sinkShip(shipType);
            if(!params.game.isP1Turn && !params.game.p2.isRealPlayer) untrackHitShip(shipType);
        }
    }
}

const yelenaAttack = (attackedPlayer, row, col, hitBlock, attackingPlayer) => {
    console.log("yelena attack")
    normalAttack(attackedPlayer, row, col, hitBlock, attackingPlayer);
    const coords = [];
    const domNums = [];
    const domBlocks = [];
    const coordMods = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    coordMods.forEach(mod => {
        if(row + mod[0] >= 0 && row + mod[0] <= 9 && col + mod[1] >= 0 && col + mod[1] <= 9) {
            coords.push([row + mod[0], col + mod[1]]);
        }
    });
    coords.forEach(coord => {
        domNums.push((coord[0] * 10) + coord[1]);
    });
    let receivingPlayer = "";
    params.game.isP1Turn ? receivingPlayer = "p2" : receivingPlayer = "p1";
    domNums.forEach(num => {
        const block = document.querySelector(`[data-block-num="${num}"].${receivingPlayer}-block`);
        domBlocks.push(block);
    });
    for(let i = 0; i < coords.length; i++) {
        if(!domBlocks[i].classList.contains("attacked-hit") && !domBlocks[i].classList.contains("attacked-miss")
        && !domBlocks[i].classList.contains("attacked-sunk")) {
            revealBlock(attackedPlayer, domBlocks[i], coords[i]);
        }
    }
}

const shipDataFromDom = (shipBlock, player) => {
    const shipNum = shipBlock.getAttribute("data-block-num");
    const row = Math.floor(shipNum / 10);
    const col = shipNum % 10;
    return player.board.board[row][col];
}

const revealBlock = (attackedPlayer, block, coords) => {
    let attackingPlayer;
    attackedPlayer === params.game.p1 ? attackingPlayer = params.game.p2 : attackingPlayer = params.game.p1;
    if(attackedPlayer.board.board[coords[0]][coords[1]]) {
        domManip.revealHit(block);
        if(!attackingPlayer.isRealPlayer) attackingPlayer.aiInfo.revealedShips.push(block);
    } else {
        domManip.revealMiss(block);
        if(!attackingPlayer.isRealPlayer) attackingPlayer.aiInfo.revealedEmptySpaces.push(block);
    }
}

const randomAttack = () => {
    const blockNum = Math.floor(Math.random() * 100);
    const block = document.querySelector(`#player-1-grid [data-block-num="${blockNum}"]`);
    if(block.classList.contains("attacked-hit") || block.classList.contains("attacked-miss") 
    || block.classList.contains("attacked-sunk") || params.game.p2.aiInfo.revealedEmptySpaces.includes(block)) {
        randomAttack();
        return;
    }
    attackSquareUniversal(block);
}

const computerEnemyLogic = () => {
    const player = params.game.p2;
    if(Math.floor(params.game.turn / 2) >= player.aiInfo.abilityUseTurn
    && player.abilityAvailable) {
        useGadget(player);
    }
    if(player.aiInfo.revealedShips.length > 0) {
        attackSquareUniversal(player.aiInfo.revealedShips.pop());
    } else if(player.aiInfo.hitShips.length > 0) {
        // check if a ship has isHorizontal declared, and get all ships of that type
        const dirShips = params.game.p2.getDirectionedShips();
        if(dirShips) {
            const nums = dirShips.map(s => s.shipBlock.getAttribute("data-block-num"));
            let mod;
            dirShips[0].isHorizontal ? mod = 1 : mod = 10;
            // if there is space between 2 blocks of same ship type, attack it
            for(let i = 0; i < nums.length - 1; i++) {
                if(+nums[i + 1] !== +nums[i] + +mod) {
                    const block = document.querySelector(`#player-1-grid [data-block-num="${+nums[i] + mod}"]`);
                    console.log("space", +nums[i + 1], +nums[i] + +mod, block)
                    // console.log(`Space Between`, block);
                    attackSquareUniversal(block); 
                    return;
                }
            }
            // else choose 1 adjacent side and attack
            let numsIndex;
            if(Math.random() > .5) {
                mod *= -1;
                numsIndex = 0;
            } else {
                numsIndex = nums.length - 1;
            }
            let block = document.querySelector(`#player-1-grid [data-block-num="${+nums[numsIndex] + mod}"]`);
            if(!(block.classList.contains("attacked-hit") || block.classList.contains("attacked-miss") 
            || block.classList.contains("revealed-miss"))) {
                attackSquareUniversal(block);
                return;
            } else {
                let block = document.querySelector(`#player-1-grid [data-block-num="${+nums[numsIndex] + (mod * -1)}"]`);
                attackSquareUniversal(block);
                return;
            }
        }
        // if not horizontal, attack a random adjacent block:
        let hitShip, adjBlock;
        while(!adjBlock) {
            for(let ship of player.aiInfo.hitShips) {
                if(ship.adjacentHittable) {
                    hitShip = ship;
                    break;
                }
            }
            adjBlock = getRandomAdjacent(hitShip);
            if(!adjBlock) {
                hitShip.adjacentHittable = false;
                continue;
            }
            break;
        }
        attackSquareUniversal(adjBlock);
    } else {
        randomAttack();
    } 
}

const getRandomAdjacent = (ship) => {
    const shipNum = ship.shipBlock.getAttribute("data-block-num");
    let numMods = [-10, 10, -1, 1];
    numMods = numMods.sort(() => Math.random() - .5);
    let adjacentBlock;
    let badMoveCount = 0;
    for(let num of numMods) {
        
        if(parseInt(shipNum) + parseInt(num) < 0 || parseInt(shipNum) + parseInt(num) > 99) {
            // console.log(`Num: ${num} out of range ()`);
            badMoveCount++;
            continue;
        } 
        adjacentBlock = document.querySelector(`#player-1-grid [data-block-num="${parseInt(shipNum) + parseInt(num)}"]`);
        if(adjacentBlock.classList.contains("attacked-hit") || adjacentBlock.classList.contains("attacked-miss") 
        || adjacentBlock.classList.contains("revealed-miss")) {
            // console.log(`Num: ${num} failed class check`);
            badMoveCount++;
            continue;
        }
        break;
    }
    if(badMoveCount > 3) return null
    // console.log(adjacentBlock);
    return adjacentBlock
}

const checkHitShipOrientation = (hitShip) => {
    const ships = [];
    const nums = [];
    params.game.p2.aiInfo.hitShips.forEach(ship => {
        if(ship.shipData.type === hitShip.shipData.type) {
            nums.push(ship.shipBlock.getAttribute("data-block-num"));
            ships.push(ship);
        }});
    if(ships.length < 2) return;
    let isHoriz;
    nums[0] % 10 === nums[1] % 10 ? isHoriz = false : isHoriz = true;
    ships.forEach(ship => ship.isHorizontal = isHoriz);
}

const untrackHitShip = (shipType) => {
    const newHitShipList = [];
    params.game.p2.aiInfo.hitShips.forEach(ship => {
        if(ship.shipData.type !== shipType) newHitShipList.push(ship);
    });
    params.game.p2.aiInfo.hitShips = newHitShipList;
}

const newTurn = () => {
    params.game.isP1Turn = !params.game.isP1Turn;
    params.game.turn++;
    console.log(params.game.turn);
    let currPlayer;
    params.game.isP1Turn ? currPlayer = params.game.p1 : currPlayer = params.game.p2;
    // if 2p game initiate 2p turn switch
    if(!params.game.isSingleplayer) TwoPlayerNewTurn(currPlayer);
    if(currPlayer.isRealPlayer) domManip.newTurnAbilityIconCheck(currPlayer); 
    // skip shrapnel turn after ability used
    if(currPlayer.character === "shrapnel" && currPlayer.abilityTurns > 0) {
        if(currPlayer.isRealPlayer) {
            domManip.toggleBattlefieldActive();
            setTimeout(() => {
                if(params.game.isSingleplayer) currPlayer.abilityTurns--;
                currPlayer.abilityCancelable = false;
                currPlayer.abilityAvailable = false;
                // display shrapnel dialogue
                domManip.toggleBattlefieldActive();
                newTurn();
                return;
            }, 500)
        }
        else {
            currPlayer.abilityTurns--;
            currPlayer.abilityCancelable = false;
            currPlayer.abilityAvailable = false;
            // display shrapnel dialogue
            newTurn();
            return;
        }
    } else if((currPlayer.character === "yelena" || currPlayer.character === "aikawa") 
    && currPlayer.abilityTurns > 0) {
        currPlayer.abilityTurns--;
        currPlayer.abilityCancelable = false;
        currPlayer.abilityAvailable = false;
    }
    if(params.game.isSingleplayer && !currPlayer.isRealPlayer) {
        computerEnemyLogic();
    } 
}

const TwoPlayerNewTurn = (currPlayer) => {
    domManip.showPlayerGameInfo(currPlayer);
    domManip.toggleHiddenShipBlocks();
    domManip.toggleActiveBoard();
}

const gameWon = (player) => {
    alert(`${player.character} Wins!`);
}

const gadgetIconClicked = () => {
    let player;
    params.game.isP1Turn ? player = params.game.p1 : player = params.game.p2;
    if(!player.abilityAvailable) return;
    domManip.toggleAbilityActive();
    if(player.character === "aikawa") {
        player.abilityCancelable = false;
        // reveal random enemy ship
    } if(player.abilityTurns > 0 && player.abilityCancelable) {
        cancelGadget(player);
    } else {
        useGadget(player);
    }
}

const useGadget = (player) => {
    console.log("use gadget");
    // if(!player.isRealPlayer) player.abilityAvailable = false;
    if(player.character === "shrapnel") {
        player.abilityTurns = 1;
    } else {
        player.abilityTurns = 3;
    }
    if(player.character === "aikawa") {
        revealRandomShipSquare();
        player.abilityAvailable = false;
    }
}

const cancelGadget = (player) => {
    if(player.abilityAvailable === true) {
        player.abilityTurns = 0;
    }
}

const revealRandomShipSquare = () => {
    let enemyBoard;
    let enemyPlayerNum = "";
    let enemyPlayer;
    const ships = [];
    if(params.game.isP1Turn) {
        enemyBoard = params.game.p2.board.board;
        enemyPlayerNum = "p2";
        enemyPlayer = params.game.p2;
    } else {
        enemyBoard = params.game.p1.board.board;
        enemyPlayerNum = "p1";  
        enemyPlayer = params.game.p1;   
    }
    for(let i = 0; i < enemyBoard.length; i++) {
        for(let j = 0; j < enemyBoard.length; j++) {
            if(enemyBoard[i][j] !== null && enemyBoard[i][j] !== "X" && !enemyBoard[i][j].isSunk()) {
                ships.push([enemyBoard[i][j], i, j]);
            }
        }
    }
    while(true) {
        const shipIndex = Math.floor(Math.random() * ships.length);
        const shipInfo = ships[shipIndex];
        const shipNum = shipInfo[1] * 10 + shipInfo[2];
        const shipDom = document.querySelector(`[data-block-num="${shipNum}"].${enemyPlayerNum}-block`);
        if(shipDom.classList.contains("attacked-hit") || shipDom.classList.contains("attacked-miss")) {
            ships.splice(shipIndex, 1);
        } else {
            revealBlock(enemyPlayer, shipDom, [shipInfo[1], shipInfo[2]]);
            break;
        }
    }
}

const passScreenTransition = () => {
    // timeout so players can see if they hit or not before screen change 
    setTimeout(() => {
        // nested timeout so other board doesnt show before screen change
        domManip.changeScreen("pass-screen");
        setTimeout(() => {
            newTurn();
        }, 500);
    }, 500);
}

const init = () => {
    // setup single player button event listener
    const singleplayerButton = document.querySelector(".singleplayer-button");
    singleplayerButton.addEventListener("click", startSinglePlayer);

    // setup two player button event listener
    const twoplayerButton = document.querySelector(".twoplayer-button");
    twoplayerButton.addEventListener("click", startTwoPlayer);

    // setup select character event listener
    const selectCharButton = document.querySelector(".select-character-button");
    selectCharButton.addEventListener("click", selectChar);

    // Display characters on char select screen and select top by default
    params.characters.forEach(char => domManip.displayCharIcon(char));
    const charIcons = Array.from(document.querySelectorAll(".charIcon"));
    charIcons.forEach(icon => icon.addEventListener("click", () => charIconClicked(icon)));
    charIconClicked(charIcons[0]);

    domManip.setupGrids();

    // setup ship selection fn
    const shipCards = Array.from(document.querySelectorAll(".ship-card"));
    shipCards.forEach(card => card.addEventListener("click", domManip.selectShip))

    // setup ship placing hover
    const battlefieldContainer = document.querySelector(".battlefield-container");
    battlefieldContainer.addEventListener("mouseover", domManip.hoverGridCell);
    battlefieldContainer.addEventListener("mouseout", domManip.unhoverGridCell);

    // toggle horiz vert slider with keyboard
    const checkbox = document.querySelector("#rotation-slider");
    window.addEventListener("keydown", domManip.toggleCheckbox);
    checkbox.addEventListener("change", () => params.game.placeHorizontal = !checkbox.checked);

    // place ships
    battlefieldContainer.addEventListener("click", placeShip);

    // board setup reset button
    const resetGridButton = document.querySelector(".reset-grid-button");
    resetGridButton.addEventListener("click", resetGrid);

    // ready button
    const readyButton = document.querySelector(".ready-button");
    readyButton.addEventListener("click", readyButtonClicked);

    // gadget icon
    const abilityIcon = document.querySelector(".ability-icon");
    abilityIcon.addEventListener("click", gadgetIconClicked);

    // pass screen button
    const confirmPassButton = document.querySelector("#confirm-pass-btn");
    confirmPassButton.addEventListener("click", () => domManip.changeScreen("game-screen"));
}
init();








