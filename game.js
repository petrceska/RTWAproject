const Field = require("./field");
const PlayerStats = require("./PlayerStats");

class Game {
    static createSingleplayer(player, socket, fieldSize) {
        return new Game(player, "AI", socket, null, false, fieldSize);
    }

    static createMultiplayer(player1, player2, socket1, socket2, fieldSize) {
        return new Game(player1, player2, socket1, socket2, true, fieldSize);
    }

    constructor(player1, player2, socket1, socket2, type, fieldSize = 10) {
        this.fieldSize = fieldSize;
        if (fieldSize == null) {
            this.fieldSize = 10;
        }

        this.player1 = new Player(player1, socket1, new Field(fieldSize));
        this.player2 = new Player(player2, socket2, new Field(fieldSize));
        this.player1Turn = true;
        this.multiplayer = type;
        this.singleplayer = !type;
        this.winner = null;
        this.start = null;
        this.shipsSettled = false;
    }

    myTurn(id) {
        return (this.player1.socket.id === id && this.player1Turn) || (this.player2.socket.id === id && !this.player1Turn);
    }

    shoot(x, y, socketId) {
        let field;
        if (socketId === this.player1.socket.id) {
            field = this.player2.field;
        } else {
            field = this.player1.field;
        }

        if (field.checkShipPosition(x, y)) {
            field.shipHit(x, y);
            return true;
        } else {
            field.shipMiss(x, y);
            return false;

        }
    }

    checkSankShips(socket) {
        if (socket !== null && this.player1.socket.id === socket.id) {
            return this.player2.field.checkDestroyedShips()
        }
        return this.player1.field.checkDestroyedShips()
    }

    checkGameWon(socket) {
        if (socket !== null && this.player1.socket.id === socket.id) {
            if (this.player2.field.currentShipsNum === 0) {
                this.winner = this.player1;
                socket.emit('game ended', 'win');

                if (this.player2.socket !== null) {
                    this.player2.socket.emit('game ended', 'loss');
                }
                return true;
            }
        } else {
            if (this.player1.field.currentShipsNum === 0) {
                this.winner = this.player2;
                if (socket !== null) {
                    socket.emit('game ended', 'win');
                }
                this.player1.socket.emit('game ended', 'loss');
                return true;
            }
        }
        return false;
    }

    get randomPosition() {
        return Math.round(Math.random() * this.fieldSize);
    }

    savePlayerStats(player) {
        PlayerStats.load(player.name).then(stats => {
            if (player.name === this.winner.name) {
                stats.gamesWon += 1;
                stats.score += this.fieldSize;
            } else {
                stats.score += 1;
            }

            let opponent;
            if (player.name === this.player1.name) {
                opponent = this.player2;
            } else {
                opponent = this.player1;
            }

            let hm = opponent.field.coordsOfAllHits.length / opponent.field.coordsOfAllMisses.length;

            stats.hitRate = (stats.hitRate * stats.gamesPlayed + hm) / (stats.gamesPlayed + 1);

            stats.gamesPlayed += 1;
            console.log(stats);
            stats.saveStats();
        });
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