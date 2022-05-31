const Game = require("./game");
const PlayerStats = require("./PlayerStats");
const Console = require("console");
let users = [];
let games = [];

// --------------------------------------------------------------------------------------------------------------
function evaluateGame(game) {
    let ps1 = loadStats(game.player1.name)
    let ps2 = loadStats(game.player2.name)
}

// --------------------------------------------------------------------------------------------------------------

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function server(io) {
    io.on('connection', function (socket) {
        console.log('a user connected');

        socket.on("it's me", (name) => {
            name = name.toLowerCase()
            if (name !== null || users[name] !== null) {
                console.log('returning user: ' + name + ' (after a client refresh). Welcome back!');
            } else {
                console.log('new user by the name of: ' + name);
            }
            users[name] = socket;
            //TODO: Solve case when players have the same name
            // Proposal: make a dictionary with name and id where ID will be generated automaticaly and everything will be matched to it
        });

        socket.on('chat message', function (msg) {
            console.log('message: ' + msg);
            io.emit('chat message', msg);
        });

        socket.on('shoot', function (msg) {

            let coord = null;
            try {
                coord = msg.split(",");

                if (coord == null || coord[0] == null || coord[1] == null) {
                    socket.emit('error', `You can not shoot at position: "${msg}"`);
                }
            } catch (e) {
                socket.emit('error', `You can not shoot at position: "${msg}"`);
            }

            let game = games[socket.id]; //TODO existuje hra -> načist novou
            if (game == null) {
                socket.emit('error', `There is no game associated with user ${getKeyByValue(users, socket)}.`);
                return
            }

            if (game.singleplayer) { //TODO better AI
                if (game.shoot(coord[0], coord[1], socket.id)) {
                    socket.emit('hit', `${coord[0]},${coord[1]}`);
                    let destroyed = game.checkDestroyedShips();
                    if (destroyed !== null) {
                        let coords = [];
                        destroyed.position.forEach(function (i) {
                            coords.push(i);
                        });
                        socket.emit('ship sank', JSON.stringify(coords));
                        JSON.stringify(coords)
                    }
                } else {
                    socket.emit('miss', `${coord[0]},${coord[1]}`);
                }
                let x = game.randomPosition
                let y = game.randomPosition
                console.log(x, y);
                if (game.shoot(x, y, null)) { // AI is shooting
                    socket.emit('opponent hit', `${x},${y}`);
                } else {
                    socket.emit('opponent miss', `${x},${y}`);
                }
                return;
            }

            if (game.multiplayer) {
                if (game.myTurn(socket.id)) {
                    let opponentSocket;
                    if (game.player1Turn) {
                        opponentSocket = game.player2.socket;
                    } else {
                        opponentSocket = game.player1.socket;
                    }
                    if (game.shoot(coord[0], coord[1], socket.id)) {
                        socket.emit('hit', `${coord[0]},${coord[1]}`);
                        opponentSocket.emit('opponent hit', `${coord[0]},${coord[1]}`)
                    } else {
                        socket.emit('miss', `${coord[0]},${coord[1]}`);
                        opponentSocket.emit('opponent miss', `${coord[0]},${coord[1]}`);
                    }
                } else {
                    socket.emit('not your turn');
                }
            }
            // socket.emit('game ended', `win`);
            // socket.emit('game ended', `loss`);
            // game.player2.socket.emit('game invite', `${game.player1.name}`);
            // TODO responses


        });

        socket.on("decline", name => removeInvite(name));

        socket.on("accept", (name) => {
            if (users[name] !== null) {
                let game = games[socket.id];
                if (game == null) {
                    socket.emit('error', `There is no game associated with user ${name}.`);
                    return
                }
                game.start = new Date();
                game.player1.socket.emit('construct game', `field=${game.fieldSize} yourTurn`); //${game.player1.field.fieldSize} - ${game.player1.field.shipsNum}
                game.player2.socket.emit('construct game', `field=${game.fieldSize}`); //${game.player1.field.fieldSize} - ${game.player1.field.shipsNum}
                //TODO create objects and start game

            } else {
                socket.emit('error', `There is no game associated with user ${name}.`);
            }
        });

        socket.on("scoreboard", () => {
            PlayerStats.scoreboard().then(scoreboard => {
                socket.emit('scoreboard', JSON.stringify(scoreboard));
            });
        });

        socket.on("stats", (name) => {
            PlayerStats.load(name).then(stats => {
                socket.emit('stats', JSON.stringify(stats));
            });
        });

        socket.on("cancel", name => removeInvite(name));

        socket.on('play', function (msg) {

            let argArray = msg.split(" ");
            let fieldSize = 10;
            let opponent = null;
            for (let i in argArray) {
                let arg = argArray[i].split("=");
                if (arg[0] !== '') {
                    switch (arg[0]) {
                        case "field":
                            console.log(arg[1]);
                            fieldSize = Math.max(8, Math.min(parseInt(arg[1]), 26)); // field size between 10, 25
                            break;
                        case "opponent":
                            console.log(arg[1]);
                            opponent = arg[1];
                            break;
                        default:
                            console.log("emit");
                            socket.emit('error', `There is something wrong with argument "${argArray[i]}"`);
                            return;
                    }
                }
            }

            if (opponent == null) {
                let game = Game.createSingleplayer(getKeyByValue(users, socket), socket, fieldSize);
                game.start = new Date();
                game.player1.field.randomlyFillShips()
                game.player2.field.randomlyFillShips()
                games[socket.id] = game
                socket.emit('construct game', `field=${game.fieldSize} yourTurn`); //${game.player1.field.fieldSize} - ${game.player1.field.shipsNum}
                socket.emit('render ships', "player=" + game.player1.field.coordOfAllShips); //${game.player1.field.fieldSize} - ${game.player1.field.shipsNum}

            } else {
                let opponentSocket = users[opponent]
                if (!opponent in users || opponentSocket == null) {
                    socket.emit('error', `There is no user with nickname "${opponent}"`);
                    return;
                }

                let game = Game.createMultiplayer(getKeyByValue(users, socket), opponent, socket, opponentSocket, fieldSize);
                games[socket.id] = game
                games[game.player2.socket.id] = game
                socket.emit('waiting for opponent', `opponent=${game.player2.name}`);
                game.player2.socket.emit('game invite', `opponent=${game.player1.name}`);

            }
        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}

function removeInvite(name) {
    if (users[name] !== null) {
        let game = games[socket.id];
        if (game == null) {
            socket.emit('error', `There is no game associated with user ${name}.`);
            return
        }

        game.player1.socket.emit('invite deleted', `Game invite was deleted. (opponent: "${game.player2.name}")`);
        delete games[game.player1.socket.id]

        if (game.multiplayer) {
            game.player2.socket.emit('invite deleted', `Game invite was deleted. (opponent: "${game.player1.name}")`);
            delete games[game.player2.socket.id]
        }

    } else {
        socket.emit('error', `There is no game associated with user ${name}.`);
    }
}


// PlayerStats.load(game.player1.name).then(stats => {
// TODO uložení
//     stats.gamesPlayed += 1;
//     console.log(stats)
//     stats.saveStats()
// });

module.exports = server
