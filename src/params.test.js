import { params } from "./params.js";

describe('Ship Functions', () => {
    const ship = new params.Ship(3);

    test('returns correct initial values', () => {
        expect(ship.getSize()).toBe(3);
        expect(ship.getHits()).toBe(0);
        expect(ship.isSunk()).toBe(false);
    });

    test('ship gets hit', () => {
        ship.hit();
        expect(ship.getHits()).toBe(1);
        ship.hit();
        ship.hit();
        expect(ship.getHits()).toBe(3);
        ship.hit();
        expect(ship.getHits()).toBe(3);
    });

    test('ship gets sunk', () => {
        ship.hits = 0;
        ship.hit();
        ship.hit();
        expect(ship.isSunk()).toBe(false);
        ship.hit();
        expect(ship.isSunk()).toBe(true);
    })

    test('ship rotates', () => {
        expect(ship.isHorizontal()).toBe(true);
        expect(ship.rotate()).toBe(false);
        expect(ship.isHorizontal()).toBe(false);
    })

})