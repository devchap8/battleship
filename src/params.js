class Ship {
    constructor(size) {
        this.size = size;
        this.hits = 0;
        this.sunk = false;
        this.horizontal = true;
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


const params = {Ship};
export {params};