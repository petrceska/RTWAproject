const Ship = require("./ship");

class Field {
    constructor(fieldSize) {

        if (fieldSize === null) {
            fieldSize = 10;
        }
        this.fieldSize = fieldSize;
        this.field = Array.from(Array(fieldSize), () => new Array(fieldSize).fill(0));
        this.ships = [];
    }

    set setFieldShips(ships) {
        this.ships = ships;
        this.shipsNum = this.ships.length;
        this.currentShipsNum = this.shipsNum;
    }

    get getShips() {
        return this.ships;
    }

    get getField() {
        return this.field;
    }

    static getRandomInt(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    addShip(ship) {
        this.ships.push(ship);
    }

    shipHit(x, y) {
        this.field[x][y] = 2;
    }

    shipMiss(x, y) {
        this.field[x][y] = 2;
    }

    checkDestroyedShips() {
        let destroyedShip = null;
        for (let i = 0; i < this.ships.length; i++) {
            let ship = this.ships[i];
            let destroyed = isShipDestroyed(ship);
            if (destroyed) {
                destroyedShip = ship;
            }
        }
        return destroyedShip;
    }

    isShipDestroyed(ship) {
        let count = 0;
        for (let i = 0; i < this.ship.position.length; i++) {
            coordinates = this.ship.position;
            let x = coordinates[i][0];
            let y = coordinates[i][1];
            if (this.field[x][y] === 2) {
                count++;
                if (count === ship.position.length) {
                    ship.destroyed = true;
                    this.currentShipsNum--;
                    return true;
                }
            }
        }

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
                    this.saveIndexToArray(indexRowSequence, i, j);
                } else {
                    // end of sequences of available space where to put a ship
                    if (indexRowSequence.length !== 0) {
                        rowSequences.push(indexRowSequence);
                        indexRowSequence = [];
                    }
                }
                // also save sequence of indexes in oposite direction
                if (arr[j][i] === 0) {
                    this.saveIndexToArray(indexColSequence, j, i);
                } else {
                    // end of a sequence
                    if (indexColSequence.length !== 0) {
                        colSequences.push(indexColSequence);
                        indexColSequence = [];
                    }
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

    checkShipPosition(x, y) {
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
                    this.saveIndexToArray(shape2x2, i, j);
                    this.saveIndexToArray(shape2x2, i + 1, j);
                    this.saveIndexToArray(shape2x2, i, j + 1);
                    this.saveIndexToArray(shape2x2, i + 1, j + 1);
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
                    this.saveIndexToArray(shape3x2, i, j);
                    this.saveIndexToArray(shape3x2, i + 1, j);
                    this.saveIndexToArray(shape3x2, i, j + 1);
                    this.saveIndexToArray(shape3x2, i + 1, j + 1);
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
                    this.saveIndexToArray(shape2x3, i, j);
                    this.saveIndexToArray(shape2x3, i + 1, j);
                    this.saveIndexToArray(shape2x3, i, j + 1);
                    this.saveIndexToArray(shape2x3, i + 1, j + 1);
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

    setValueInField(x, y, value) {
        this.field[x][y] = value;
    }

    randomlyFillShips() {
        let ship = new Ship("2x1");
        let sheep = new Ship("2x1");
        let lodka = new Ship("2x1");
        let lambada = new Ship("1x2");
        let lodka_v_mori = new Ship("1x2");
        let sombrero = new Ship("3x1");
        let aurora = new Ship("3x1");
        let parnik = new Ship("3x1");
        let laparadise = new Ship("1x3");
        let clun = new Ship("1x3");
        let moskva = new Ship("4x1");
        let torpednik = new Ship("4x1");
        let bitevnik = new Ship("2x2");
        let moskva_na_dne = new Ship("3x2");
        let kriznik = new Ship("2x3");
        if (this.fieldSize <= 8) {
            this.setFieldShips = [ship, lambada, lodka_v_mori, sombrero, clun, aurora, moskva];
        } else if (this.fieldSize <= 10) {
            this.setFieldShips = [ship, sheep, lambada, lodka_v_mori, sombrero, clun, aurora, moskva, laparadise];
        } else if (this.fieldSize <= 12) {
            this.setFieldShips = [ship, sheep, kriznik, lodka_v_mori, sombrero, clun, parnik, lambada, aurora, moskva, torpednik];
        } else if (this.fieldSize <= 15) {
            this.setFieldShips = [ship, sheep, kriznik, lodka, lodka_v_mori, sombrero, clun, parnik, lambada, aurora, moskva, torpednik];
        } else if (this.fieldSize <= 17) {
            this.setFieldShips = [ship, sheep, kriznik, lodka, lodka_v_mori, sombrero, bitevnik, clun, parnik, lambada, aurora, moskva, torpednik];
        } else {
            this.setFieldShips = [ship, sheep, kriznik, lodka, lodka_v_mori, sombrero, bitevnik, clun, parnik, lambada, aurora, moskva, torpednik, moskva_na_dne];
        }
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].width === 1) {
                let availablePlaces = [];
                let fieldWidthPlaces = this.getAvailable1xXSpaces()[0];
                for (let j = 0; j < fieldWidthPlaces.length; j++) {
                    if (fieldWidthPlaces[j].length >= this.ships[i].len)
                        availablePlaces.push(fieldWidthPlaces[j]);
                }
                let placeIndex = Field.getRandomInt(0, availablePlaces.length - 1);
                console.log("!!!---place len index---!!!");
                console.log(placeIndex);
                console.log("available Len Places");
                console.log(availablePlaces);
                console.log("availablePlaces[placeIndex]");
                console.log(availablePlaces[placeIndex]);
                let avalPlace = availablePlaces[placeIndex];
                let slice = avalPlace.slice(0, this.ships[i].position.length);
                this.ships[i].changePosition(slice);
                console.log("----------this.ships[i]------------");
                console.log(this.ships[i]);
                console.log("slice");
                console.log(slice);
                console.log("this.ships[i].position.length");
                console.log(this.ships[i].position.length);
                for (let k = 0; k < this.ships[i].position.length; k++) {
                    let x = this.ships[i].position[k][0];
                    let y = this.ships[i].position[k][1];
                    this.setValueInField(x, y, 1);
                }
            } else if (this.ships[i].len === 1) {
                let availablePlaces = [];
                let fieldLenPlaces = this.getAvailable1xXSpaces()[1];
                for (let j = 0; j < fieldLenPlaces.length; j++) {
                    if (fieldLenPlaces[j].length >= this.ships[i].width)
                        availablePlaces.push(fieldLenPlaces[j]);
                }
                let placeIndex = Field.getRandomInt(0, availablePlaces.length - 1);
                let avalPlace = availablePlaces[placeIndex];
                let slice = avalPlace.slice(0, this.ships[i].position.length);
                console.log("!!!---place width index---!!!");
                console.log(placeIndex);
                console.log("available Len Places");
                console.log(availablePlaces);
                console.log("slice");
                console.log(slice);
                console.log("this.ships[i].position.length");
                console.log(this.ships[i].position.length);
                this.ships[i].changePosition(slice);
                console.log("----------this.ships[i]------------");
                console.log(this.ships[i]);
                for (let k = 0; k < this.ships[i].position.length; k++) {
                    console.log("this.ships[i].position[k][0]");
                    console.log(this.ships[i].position[k][0]);
                    let x = this.ships[i].position[k][0];
                    let y = this.ships[i].position[k][1];
                    this.setValueInField(x, y, 1);
                }
            }
            else if (this.ships[i].len === 2 && this.ships[i].width === 2) {
                let availablePlaces = [];
                let fieldLenPlaces = this.getAvailable2x2Spaces();
                for (let j = 0; j < fieldLenPlaces.length; j++) {
                    if (fieldLenPlaces[j].length >= this.ships[i].width)
                        availablePlaces.push(fieldLenPlaces[j]);
                }
                let placeIndex = Field.getRandomInt(0, availablePlaces.length - 1);
                let avalPlace = availablePlaces[placeIndex];
                let slice = avalPlace.slice(0, this.ships[i].position.length);
                this.ships[i].changePosition(slice);
                for (let k = 0; k < this.ships[i].position.length; k++) {
                    let x = this.ships[i].position[k][0];
                    let y = this.ships[i].position[k][1];
                    this.setValueInField(x, y, 1);
                }
            }
            else if (this.ships[i].len === 3 && this.ships[i].width === 2) {
                let availablePlaces = [];
                let fieldLenPlaces = this.getAvailable3x2Spaces();
                for (let j = 0; j < fieldLenPlaces.length; j++) {
                    if (fieldLenPlaces[j].length >= this.ships[i].width)
                        availablePlaces.push(fieldLenPlaces[j]);
                }
                let placeIndex = Field.getRandomInt(0, availablePlaces.length - 1);
                let avalPlace = availablePlaces[placeIndex];
                let slice = avalPlace.slice(0, this.ships[i].position.length);
                this.ships[i].changePosition(slice);
                for (let k = 0; k < this.ships[i].position.length; k++) {
                    let x = this.ships[i].position[k][0];
                    let y = this.ships[i].position[k][1];
                    this.setValueInField(x, y, 1);
                }
            }
            else if (this.ships[i].len === 2 && this.ships[i].width === 3) {
                let availablePlaces = [];
                let fieldLenPlaces = this.getAvailable2x3Spaces();
                for (let j = 0; j < fieldLenPlaces.length; j++) {
                    if (fieldLenPlaces[j].length >= this.ships[i].width)
                        availablePlaces.push(fieldLenPlaces[j]);
                }
                let placeIndex = Field.getRandomInt(0, availablePlaces.length - 1);
                let avalPlace = availablePlaces[placeIndex];
                let slice = avalPlace.slice(0, this.ships[i].position.length);
                this.ships[i].changePosition(slice);
                for (let k = 0; k < this.ships[i].position.length; k++) {
                    let x = this.ships[i].position[k][0];
                    let y = this.ships[i].position[k][1];
                    this.setValueInField(x, y, 1);
                }
            }
        }
    }

    putShipToField(type, x, y) {
        let ship = new Ship(type);
        let position = [];
        if (x + ship.width >= this.fieldSize || y + ship.len >= this.fieldSize) {
            console.log("It is not possible to put ship in chosen position, it would be put out of the field.");
            return -1;
        }
        if (!this.checkShipPosition(x, y)) {
            for (let i = x; i < x + ship.width; i++) {
                for (let j = y; j < y + ship.len; j++) {
                    if (!this.checkShipPosition(i, j)) {
                        this.saveIndexToArray(position, i, j);
                    }
                    else {
                        console.log("It is not possible to put ship to position: [%d,%d].", i, j);
                        return -1;
                    }
                }
            }
            if (position.length !== 0) {
                if (position.length !== (ship.len * ship.width)) {
                    console.log("Position is not fitting this type of ship.");
                    return -1;
                }
                ship.changePosition(position);
                for (let i = 0; i < position.length; i++) {
                    this.setValueInField(position[i][0], position[i][1], 1);
                }
                console.log("ship.position[0]");
                console.log(ship.position[0]);
                this.addShip(ship);
            }
        }
        else {
            console.log("It is not possible to put ship to position: [%d,%d].", x, y);
            return -1;
        }
    }

}

module.exports = Field