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
        this.board.fill(new Array(10), 0, 10);
        this.board.forEach(row => row.fill(null, 0, 10));
    }
}



const params = {Ship, Gameboard};
export {params};