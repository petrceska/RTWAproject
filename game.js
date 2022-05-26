class Game {
    static createSingleplayer(player, socket, fieldSize) {
        return new Game(player, null, socket, null, false, fieldSize);
    }

    static createMultiplayer(player1, player2, socket1, socket2, fieldSize) {
        return new Game(player1, player2, socket1, socket2, true, fieldSize);
    }

    constructor(player1, player2, socket1, socket2, type, fieldSize = 10) {
        this.player1 = new Player(player1, socket1, new Field(fieldSize));
        this.player2 = new Player(player2, socket2, new Field(fieldSize));
        this.multiplayer = type;
        this.singleplayer = !type;
        this.winner = null;
        this.start = null;
        this.end = null;
    }

}

class Player {
    constructor(name, socket, ships, field) {
        this.name = name;
        this.socket = socket;
        this.ships = ships;
        this.field = field;
    }
}

class Field {
    constructor(fieldSize) {
        this.fieldSize = fieldSize;
    }

    set setSize(fieldSize) {
        if (fieldSize !== null) {
            this.fieldSize = fieldSize
        }
    }

    set setFieldShips(ships) {
        this.ships = new Array(ships);
        this.shipsNum = this.ships.length;
        this.currentShipsNum = shipsNum;
    }

}

class Ship {
    constructor(type, pos_x, pos_y) {
        this.type = type;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
    }
    // check if the ship's position is on the position of another ship 

}
module.exports = Game