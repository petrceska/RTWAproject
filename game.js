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
    constructor(name, socket, field) {
        this.name = name;
        this.socket = socket;
        this.field = field;
    }
}

class Field {
    constructor(fieldSize) {
        this.fieldSize = fieldSize;
        this.field = Array.from(Array(fieldSize), () => Array(fieldSize).fill(0));
    }

    set setSize(fieldSize) {
        if (fieldSize !== null) {
            this.fieldSize = fieldSize;
            this.field = Array.from(Array(fieldSize), () => Array(fieldSize).fill(0));
        }
    }

    set setFieldShips(ships) {
        this.ships = new Array(ships);
        this.shipsNum = this.ships.length;
        this.currentShipsNum = shipsNum;
    }


    /*
    shipUniquePositions() {
        for (ship in this.ships) {

        }
    }
    */
    // check if the ship's position is on the position of another ship 
}

class Ship {
    constructor(type, pos_x, pos_y) {
        this.type = type;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.len
    }

    set setType(type) {
        this.type = type;
        this.shipSize(type);
    }

    changeShipPosition(x = this.pos_x, y = this.pos_y) {
        this.pos_x = x;
        this.pos_y = y;
    }

    shipSize(type) {
        switch (type) {
            case "2x1":
                this.len = 2;
                this.width = 1;
                break;
            case "3x1":
                this.len = 3;
                this.width = 1;
                break;
            case "4x1":
                this.len = 4;
                this.width = 1;
                break;
            case "1x2":
                this.len = 1;
                this.width = 2;
                break;
            case "1x3":
                this.len = 1;
                this.width = 3;
                break;
            case "1x4":
                this.len = 1;
                this.width = 4;
                break;
            case "2x2":
                this.len = 2;
                this.width = 2;
                break;
            default:
                this.len = 2;
                this.width = 1;
                return;
        }
    }

}
module.exports = Game