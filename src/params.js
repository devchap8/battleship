class Ship {
    #size;
    #hits;
    #sunk;
    #horizontal;
    constructor(size, horizontal) {
        this.#size = size;
        this.#hits = 0;
        this.#sunk = false;
        this.#horizontal = horizontal;
    }

    getSize = () => this.#size;
    getHits = () => this.#hits;
    isHorizontal = () => this.#horizontal

    hit = () => {
        if(this.#hits < this.#size) this.#hits++;
    } 

    isSunk = () => {
        if(this.#hits >= this.#size) {
            this.#sunk = true;
        }
        return this.#sunk;
    }

    rotate = () => {
        this.#horizontal = !this.#horizontal;
        return this.#horizontal;
    }
}

class Gameboard {
    constructor() {
        this.board = new Array(10);
        for(let i = 0; i < 10; i++) {
            const arr = new Array(10);
            this.board[i] = arr;
        }
        this.board.forEach(row => row.fill(null, 0, 10));
    }

    isValidMove = (size, horiz, x, y) => {
        // x and y mark the top left corner of the ship
        if(horiz && ((y + size - 1) > 9 || x > 9)) return false
        if(!horiz && (y > 9 || (x + size - 1) > 9)) return false
        return true
    }

    placeShip = (ship, x, y) => {
        if(!this.isValidMove(ship.getSize(), ship.isHorizontal(), x, y)) return false;
        for(let i = 0; i < ship.getSize(); i++) {
            this.board[x][y] = ship;
            ship.isHorizontal() ? y++ : x++;
        }
        return true;
    }

    receiveAttack = (x, y) => {
        // look at gameboard at x, y
        // if there is a ship there
            // run hit on the ship
            // replace ship with "O"
            // return object with x, y, and wasHit set to true
        // if not
            // replace null with "X"
            // return object with x, y, and wasHit set to false
        
    }
}

// let gameboard = new Gameboard();
// let ship5 = new Ship(5, true);
// console.log(gameboard.placeShip(ship5, 0, 0))
// console.log(gameboard.board);

const params = {Ship, Gameboard};
export {params};