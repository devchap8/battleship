class Ship {
    constructor(size, horizontal) {
        this.size = size;
        this.hits = 0;
        this.sunk = false;
        this.horizontal = horizontal;
    }

    getSize = () => this.size;
    getHits = () => this.hits;
    isHorizontal = () => this.horizontal

    hit = () => {
        if(this.hits < this.size) this.hits++;
    } 

    isSunk = () => {
        if(this.hits >= this.size) {
            this.sunk = true;
        }
        return this.sunk;
    }

    rotate = () => {
        this.horizontal = !this.horizontal;
        return this.horizontal;
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
        if(!this.isValidMove(ship.size, ship.horizontal, x, y)) return false;
        for(let i = 0; i < ship.size; i++) {
            this.board[x][y] = ship;
            ship.horizontal ? y++ : x++;
        }
        return true;
    }
}

// const board = new Gameboard();
// let ship5 = new Ship(5, true);
// board.placeShip(ship5, 0, 0);
// console.log(board.board);


const params = {Ship, Gameboard};
export {params};