class Game {
    static createSingleplayer(player, socket) {
        return new Game(player, null, socket, null, false);
    }

    static createMultiplayer(player1, player2, socket1, socket2) {
        return new Game(player1, player2, socket1, socket2, true);
    }

    constructor(player1, player2, socket1, socket2, type) {
        this.fieldSize = 10;
        this.shipsNum = 6;
        this.player1 = new Player(player1, socket1, this.shipsNum);
        this.player2 = new Player(player2, socket2, this.shipsNum);
        this.multiplayer = type;
        this.singleplayer = !type;
        this.winner = null;
        this.start = null;
        this.end = null;
    }

    set ships(shipsNum){
        let difference = shipsNum - this.shipsNum
        if (shipsNum !== null){
            this.shipsNum += difference
            this.player1.remainingShips += difference
            this.player2.remainingShips += difference
        }
    }

    set field(fieldSize){
        if (fieldSize !== null){
            this.fieldSize = fieldSize
        }
    }
}

class Player{
    constructor(name, socket, ships) {
        this.name = name;
        this.socket = socket;
        this.remainingShips = ships;
    }
}

module.exports = Game