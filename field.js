const Ship = require("./ship");

class Field {
    constructor(fieldSize) {

        if (fieldSize === null) {
            fieldSize = 10;
        }
        this.fieldSize = fieldSize;
        this.field = Array.from(Array(fieldSize), () => new Array(fieldSize).fill(0));
        this.setPossibleShips = fieldSize;
        this.ships = [];
        this.destroyedShips = [];
        this.currentShipsNum = 0;
        this.shipPossibleTypes = [["2x1", "1x2"], ["3x1", "1x3"], ["4x1", "1x4"],];
    }

    set setFieldShips(ships) {
        this.ships = ships;
        this.shipsNum = this.ships.length;
        this.currentShipsNum = this.shipsNum;
    }

    set setPossibleShips(fieldSize) {
        if (fieldSize <= 8) {
            this.setPossibleTypeNumbers(3, 3, 1);
        } else if (fieldSize <= 10) {
            this.setPossibleTypeNumbers(4, 4, 2);
        } else if (fieldSize <= 12) {
            this.setPossibleTypeNumbers(5, 5, 2);
        } else if (fieldSize <= 15) {
            this.setPossibleTypeNumbers(8, 8, 4);
        } else if (fieldSize <= 17) {
            this.setPossibleTypeNumbers(10, 10, 5);
        } else {
            this.setPossibleTypeNumbers(12, 12, 6);
        }
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
        this.shipsNum = this.ships.length;
        this.currentShipsNum = this.shipsNum;
    }

    shipHit(x, y) {
        this.field[x][y] = 2;
    }

    shipMiss(x, y) {
        this.field[x][y] = 3;
    }

    setPossibleTypeNumbers(size2x1 = 4, size3x1 = 4, size4x1 = 2, size2x2 = 0, size3x2 = 0) {
        this.possibleShips = {
            "2x1": size2x1,
            "3x1": size3x1,
            "4x1": size4x1,
            "2x2": size2x2,
            "3x2": size3x2,
        };
        this.setMaxNumOfShips();
    }

    setMaxNumOfShips() {
        let value = 0;
        for (var key in this.possibleShips) {
            value += this.possibleShips[key];
        }
        this.maxNumOfShips = value;
    }

    checkDestroyedShips() {
        for (let i = 0; i < this.ships.length; i++) {
            let ship = this.ships[i];

            if (this.isShipDestroyed(ship)) {
                this.destroyedShips.push(ship);
                this.ships.splice(i, 1);
                return ship;
            }
        }
        return null;
    }

    isShipDestroyed(ship) {
        let count = 0;
        for (let i = 0; i < ship.position.length; i++) {
            let coordinates = ship.position;
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
                    this.saveIndexesToArray(indexRowSequence, i, j);
                } else {
                    // end of sequences of available space where to put a ship
                    if (indexRowSequence.length !== 0) {
                        rowSequences.push(indexRowSequence);
                        indexRowSequence = [];
                    }
                }
                // also save sequence of indexes in oposite direction
                if (arr[j][i] === 0) {
                    this.saveIndexesToArray(indexColSequence, j, i);
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
                    this.saveIndexesToArray(shape2x2, i, j);
                    this.saveIndexesToArray(shape2x2, i + 1, j);
                    this.saveIndexesToArray(shape2x2, i, j + 1);
                    this.saveIndexesToArray(shape2x2, i + 1, j + 1);
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
                    this.saveIndexesToArray(shape3x2, i, j);
                    this.saveIndexesToArray(shape3x2, i + 1, j);
                    this.saveIndexesToArray(shape3x2, i, j + 1);
                    this.saveIndexesToArray(shape3x2, i + 1, j + 1);
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
                    this.saveIndexesToArray(shape2x3, i, j);
                    this.saveIndexesToArray(shape2x3, i + 1, j);
                    this.saveIndexesToArray(shape2x3, i, j + 1);
                    this.saveIndexesToArray(shape2x3, i + 1, j + 1);
                    shapes.push(shape2x3);
                    shape2x3 = [];
                }
            }
        }
        return shapes;
    }

    saveIndexesToArray(arr, i, j) {
        // indexes of founded 0 in given array
        let indexes = new Uint8Array(2);
        indexes[0] = i;
        indexes[1] = j;
        arr.push(indexes);
    }

    setValueInField(x, y, value) {
        this.field[x][y] = value;
    }

    shipTypesPicker(type) {
        let randomInt = Field.getRandomInt(0, 1);
        switch (type) {
            case "2x1":
                return this.shipPossibleTypes[0][randomInt];
            case "3x1":
                return this.shipPossibleTypes[1][randomInt];
            case "4x1":
                return this.shipPossibleTypes[2][randomInt];
            default:
                return this.shipPossibleTypes[0][randomInt];
        }
    }

    * generateShip(type, number) {
        for (var i = 0; i < number; i++) {
            yield new Ship(type);
        }
    }

    countShips(ships) {
        for (var i = 0; i < ships.length; i++) {
            this.countShipTypes(ships[i].type);
        }
    }

    randomlyFillShips() {
        this.field = Array.from(Array(this.fieldSize), () => new Array(this.fieldSize).fill(0));
        for (var key in this.possibleShips) {

            let generatedShips = this.generateShip(this.shipTypesPicker(key), this.possibleShips[key]);
            for (let i = 0; i < this.possibleShips[key]; i++) {
                this.addShip(generatedShips.next().value);
            }
            this.possibleShips[key] = 0;
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
                let avalPlace = availablePlaces[placeIndex];
                let slice = avalPlace.slice(0, this.ships[i].position.length);
                this.ships[i].changePosition(slice);
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
                this.ships[i].changePosition(slice);
                for (let k = 0; k < this.ships[i].position.length; k++) {
                    let x = this.ships[i].position[k][0];
                    let y = this.ships[i].position[k][1];
                    this.setValueInField(x, y, 1);
                }
            } else if (this.ships[i].len === 2 && this.ships[i].width === 2) {
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
            } else if (this.ships[i].len === 3 && this.ships[i].width === 2) {
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
            } else if (this.ships[i].len === 2 && this.ships[i].width === 3) {
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
        if (this.possibleShips[type] === 0) {
            console.error("It is not possible to put this type of ship to the field");
            return -1;
        }
        if (x + ship.width > this.fieldSize || y + ship.len > this.fieldSize) {
            console.error("It is not possible to put ship in chosen position, it would be put out of the field.");
            return -1;
        }
        if (!this.checkShipPosition(x, y)) {
            for (let i = x; i < x + ship.width; i++) {
                for (let j = y; j < y + ship.len; j++) {
                    if (!this.checkShipPosition(i, j)) {
                        this.saveIndexesToArray(position, i, j);
                    } else {
                        console.error("It is not possible to put ship to position: [%d,%d].", i, j);
                        return -1;
                    }
                }
            }
            if (position.length !== 0) {
                if (position.length !== (ship.len * ship.width)) {
                    console.error("Position is not fitting this type of ship.");
                    return -1;
                }
                ship.changePosition(position);
                for (let i = 0; i < position.length; i++) {
                    this.setValueInField(position[i][0], position[i][1], 1);
                }
                let enoughShips = this.countShipTypes(ship.type);
                if (enoughShips === -1) {
                    return -1;
                }
                this.addShip(ship);
            }
        } else {
            console.error("It is not possible to put ship to position: [%d,%d].", x, y);
            return -1;
        }
        return 0;
    }


    countShipTypes(type) {
        switch (type) {
            case "2x1":
            case "1x2":
                if (this.possibleShips["2x1"] > 0) {
                    this.possibleShips["2x1"] -= 1;
                } else {
                    console.error("You are not able to use more 2x1 or 1x2 ships.");
                    return -1;
                }
                break;
            case "3x1":
            case "1x3":
                if (this.possibleShips["3x1"] > 0) {
                    this.possibleShips["3x1"] -= 1;
                } else {
                    console.error("You are not able to use more 3x1 or 1x3 ships.");
                    return -1;
                }
                break;
            case "4x1":
            case "1x4":
                if (this.possibleShips["4x1"] > 0) {
                    this.possibleShips["4x1"] -= 1;
                } else {
                    console.error("You are not able to use more 4x1 or 1x4 ships.");
                    return -1;
                }
                break;
            case "2x2":
                if (this.possibleShips["2x2"] > 0) {
                    this.possibleShips["2x2"] -= 1;
                } else {
                    console.error("You are not able to use more 2x2 ships.");
                    return -1;
                }
                break;
            case "3x2":
            case "2x3":
                if (this.possibleShips["3x2"] > 0) {
                    this.possibleShips["3x2"] -= 1;
                } else {
                    console.error("You are not able to use more 3x2 or 2x3 ships.");
                    return -1;
                }
                break;
            default:
                return;
        }
    }

    get coordOfAllShips() {
        let coords = [];
        this.ships.forEach(function (x) {
            x.position.forEach(function (i) {
                coords.push(i);
            });
        });
        return JSON.stringify(coords)
    }

    get coordsOfAllHits() {
        let coords = [];
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                if (this.field[i][j] === 2) {
                    this.saveIndexesToArray(coords, i, j);
                }
            }
        }
        return JSON.stringify(coords);
    }

    get coordsOfAllMisses() {
        let coords = [];
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                if (this.field[i][j] === 3) {
                    this.saveIndexesToArray(coords, i, j);
                }
            }
        }
        return JSON.stringify(coords);
    }
}

module.exports = Field