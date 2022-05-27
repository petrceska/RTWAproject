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

    checkPosition(x, y) {
        if (this.field[x][y] === 1) {
            return true;
        }
    }

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
module.exports = Field