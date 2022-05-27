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

    getAvailable1xXSpaces(arr = this.field) {
        let availableSpace = [];
        let rowSequences = [];
        let colSequences = [];
        let indexRowSequence = [];
        let indexColSequence = [];
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                // if 0 then available index of field where you can put a ship
                if (arr[i][j] === 0) {
                    saveIndexToArray(indexRowSequence, i, j);
                } else {
                    // end of sequences of available space where to put a ship
                    rowSequences.push(indexRowSequence);
                    indexRowSequence = [];
                }
                // also save sequence of indexes in oposite direction
                if (arr[j][i] === 0) {
                    saveIndexToArray(indexColSequence, j, i);
                } else {
                    // end of a sequence
                    colSequences.push(indexColSequence);
                    indexColSequence = [];
                }
            }
            // end of a sequence because of the ending of a row
            if (indexRowSequence.length !== 0) {
                rowSequences.push(indexRowSequence);
                indexRowSequence = [];
            }
            // end of a sequence because of the ending of a column
            if (indexColSequence.length !== 0) {
                colSequences.push(indexColSequence);
                indexColSequence = [];
            }
        }
        availableSpace.push(rowSequences);
        availableSpace.push(colSequences);
        return availableSpace;
    }
    //TODO: check if the ship's position is on the position of another ship 
    getAvailable2x2Spaces(arr = this.field) {
        let shapes = [];
        let shape2x2 = [];
        for (var i = 0; i < this.fieldSize - 1; i++) {
            for (var j = 0; j < this.fieldSize - 1; j++) {
                // if 0 then available index of field where you can put a ship
                if (arr[i][j] === 0 && arr[i][j + 1] === 0 && arr[i + 1][j] === 0 && arr[i + 1][j + 1] === 0) {
                    saveIndexToArray(shape2x2, i, j);
                    saveIndexToArray(shape2x2, i + 1, j);
                    saveIndexToArray(shape2x2, i, j + 1);
                    saveIndexToArray(shape2x2, i + 1, j + 1);
                    shapes.push(shape2x2);
                    shape2x2 = [];
                }
            }
        }
        return shapes;
    }

    getAvailable3x2Spaces(arr = this.field) {
        let shapes = [];
        let shape3x2 = [];
        for (var i = 0; i < this.fieldSize - 1; i++) {
            for (var j = 0; j < this.fieldSize - 2; j++) {
                // if 0 then available index of field where you can put a ship
                if (arr[i][j] === 0 && arr[i][j + 1] === 0 && arr[i + 1][j] === 0 && arr[i + 1][j + 1] === 0
                    && arr[i + 1][j + 2] === 0 && arr[i][j + 2] === 0) {
                    saveIndexToArray(shape3x2, i, j);
                    saveIndexToArray(shape3x2, i + 1, j);
                    saveIndexToArray(shape3x2, i, j + 1);
                    saveIndexToArray(shape3x2, i + 1, j + 1);
                    shapes.push(shape3x2);
                    shape3x2 = [];
                }
            }
        }
        return shapes;
    }

    getAvailable2x3Spaces(arr = this.field) {
        let shapes = [];
        let shape2x3 = [];
        for (var i = 0; i < this.fieldSize - 2; i++) {
            for (var j = 0; j < this.fieldSize - 1; j++) {
                // if 0 then available index of field where you can put a ship
                if (arr[j][i] === 0 && arr[j][i + 1] === 0 && arr[j + 1][i] === 0 && arr[j + 1][i + 1] === 0
                    && arr[j + 1][i + 2] === 0 && arr[j][i + 2] === 0) {
                    saveIndexToArray(shape2x3, i, j);
                    saveIndexToArray(shape2x3, i + 1, j);
                    saveIndexToArray(shape2x3, i, j + 1);
                    saveIndexToArray(shape2x3, i + 1, j + 1);
                    shapes.push(shape2x3);
                    shape2x3 = [];
                }
            }
        }
        return shapes;
    }

    saveIndexToArray(arr, i, j) {
        // indexes of founded 0 in given array
        let indexes = new Uint8Array(2);
        indexes[0] = i;
        indexes[1] = j;
        arr.push(indexes);
    }

}

class Ship {
    constructor(type, pos_x, pos_y) {
        this.type = type;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
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