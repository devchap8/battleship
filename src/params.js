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
        if(this.#hits < this.#size) {
            this.#hits++;
            this.isSunk();
        }
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
    #shipSpaces;
    constructor() {
        this.#shipSpaces = 0;
        this.board = new Array(10);
        for(let i = 0; i < 10; i++) {
            const arr = new Array(10);
            this.board[i] = arr;
        }
        this.board.forEach(row => row.fill(null, 0, 10));
    }

    getShipSpaces = () => this.#shipSpaces;

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
            this.#shipSpaces++;
        }
        return true;
    }

    receiveAttack = (x, y) => {
        if(this.board[x][y] === "O" || this.board[x][y] === "X") {
            throw new Error("Error: This space has already been attacked");
        } else if(!this.board[x][y]) {
            this.board[x][y] = "X";
            return { x: x, y: y, wasHit: false };
        } else {
            this.board[x][y].hit();
            this.board[x][y] = "O";
            this.#shipSpaces--;
            return { x: x, y: y, wasHit: true };
        }
    }
}

class Player {
    #realPlayer;
    constructor(realPlayer) {
        this.#realPlayer = realPlayer;
        this.board = new Gameboard();
    }
    getRealPlayer = () => this.#realPlayer;
}

const params = {Ship, Gameboard, Player};
export {params};