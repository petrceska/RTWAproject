const Field = require("./field");
class Game {
    static createSingleplayer(player, socket, fieldSize) {
        return new Game(player, "AI", socket, null, false, fieldSize);
    }

    static createMultiplayer(player1, player2, socket1, socket2, fieldSize) {
        return new Game(player1, player2, socket1, socket2, true, fieldSize);
    }

    constructor(player1, player2, socket1, socket2, type, fieldSize = 10) {
        this.fieldSize = fieldSize;
        if (fieldSize == null){
            this.fieldSize = 10;
        }

        this.player1 = new Player(player1, socket1, new Field(fieldSize));
        this.player2 = new Player(player2, socket2, new Field(fieldSize));
        this.player1Turn= true;
        this.multiplayer = type;
        this.singleplayer = !type;
        this.winner = null;
        this.start = null;
        this.end = null;
    }

    myTurn(id){
        return (this.player1.socket.id === id && this.player1Turn) || (this.player2.socket.id === id && !this.player1Turn);
    }

    shoot(x, y, socketId){
        let field;
        if (socketId === this.player1.socket.id){
            field = this.player1.field;
            this.player1Turn = false;
        }else{
            field = this.player2.field;
            this.player1Turn = true;
        }

        if (field.checkShipPosition(x, y)){
            field.shipHit(x,y);
            return true;
        }else{
            field.shipMiss(x,y);
            return false;

        }
    }

    get randomPosition() {
        return Math.round(Math.random() * this.fieldSize);
    }
}

class Player {
    constructor(name, socket, field) {
        this.name = name;
        this.socket = socket;
        this.field = field;
    }
}

module.exports = Game