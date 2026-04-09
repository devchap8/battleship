import { params } from "./params.js";

describe('Ship Functions', () => {
    let ship = new params.Ship(3, true);

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
        ship = new params.Ship(3, true);
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
    let gameboard = new params.Gameboard();
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
    });

    test('board receives attacks', () => {
        expect(gameboard.getShipSpaces()).toBe(9);
        expect(gameboard.receiveAttack(9, 9)).toEqual({x:9, y:9, wasHit:true});
        expect(gameboard.board[9][9]).toBe("O");
        expect(ship1.getHits()).toBe(1);
        expect(ship1.isSunk()).toBe(true);
        expect(() => {gameboard.receiveAttack(9, 9)}).toThrow("Error: This space has already been attacked");
        expect(gameboard.receiveAttack(8, 8)).toEqual({x:8, y:8, wasHit:false});
        expect(gameboard.board[8][8]).toBe("X");
        expect(gameboard.getShipSpaces()).toBe(8);
    })

});

test('player parameters', () => {
    const player = new params.Player(true);
    expect(player.getRealPlayer()).toBe(true);
    const ship3 = new params.Ship(3, true);
    expect(player.board.placeShip(ship3, 0, 0)).toBe(true);
    expect(player.board.board[0][0]).toBe(ship3);
    player.board.receiveAttack(0, 0);
    expect(player.board.board[0][0]).toBe("O");
})