import { params } from "./params.js";

describe('Ship Functions', () => {
    const ship = new params.Ship(3, true);

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

});


describe('Gameboard Functions', () => {
    const gameboard = new params.Gameboard();

    // test('valid moves', () => {
    //     expect(gameboard.isValidMove(1, true, 0, 0)).toBe(true);
    //     expect(gameboard.isValidMove(1, true, 9, 9)).toBe(true);
    //     expect(gameboard.isValidMove(2, true, 9, 9)).toBe(false);
    //     expect(gameboard.isValidMove(5, true, 6, 6)).toBe(false);
    //     expect(gameboard.isValidMove(1, false, 0, 0)).toBe(true);
    //     expect(gameboard.isValidMove(1, false, 9, 9)).toBe(true);
    //     expect(gameboard.isValidMove(2, false, 9, 9)).toBe(false);
    //     expect(gameboard.isValidMove(5, false, 6, 6)).toBe(false);
    // });

    let ship5 = new params.Ship(5, true);
    let ship1 = new params.Ship(1, true);
    let ship3 = new params.Ship(3, false);

    test('placeShip', () => {
        expect(gameboard.placeShip(ship5, 0, 0)).toBe(true);
        expect(gameboard.board[0][0]).toBe(ship5);
        expect(gameboard.board[0][4]).toBe(ship5);
        expect(gameboard.board[0][5]).toBe(null);
        expect(gameboard.placeShip(ship5, 6, 6)).toBe(false);
        expect(gameboard.board[0][6]).toBe(null);
        expect(gameboard.board[0][9]).toBe(null);
        expect(gameboard.placeShip(ship1, 9, 9)).toBe(true);
        expect(gameboard.board[9][9]).toBe(ship1);
        expect(gameboard.placeShip(ship3, 9, 0)).toBe(false);
        expect(gameboard.board[9][0]).toBe(null);
        expect(gameboard.placeShip(ship3, 7, 0)).toBe(true);
        expect(gameboard.board[7][0]).toBe(ship3);
        expect(gameboard.board[9][0]).toBe(ship3);
    })

});