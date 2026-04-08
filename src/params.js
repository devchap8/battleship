class Ship {
    constructor(size) {
        this.size = size;
        this.hits = 0;
        this.sunk = false;
    }
    getSize = () => this.size;
    getHits = () => this.hits;

    hit = () => {
        if(this.hits < this.size) this.hits++;
    } 

    isSunk = () => {
        if(this.hits >= this.size) {
            this.sunk = true;
        }
        return this.sunk;
    }
}


const params = {Ship};
export {params};