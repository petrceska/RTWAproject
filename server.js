const Game = require("./game");
const PlayerStats = require("./PlayerStats");
let users = [];
let games = [];

// --------------------------------------------------------------------------------------------------------------

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function server(io) {
    io.on('connection', function (socket) {

        socket.on("it's me", (name) => {
            name = name.toLowerCase()
            if (name !== null || users[name] !== null) {

                let game = games[name];

                if (game !== null && game !== undefined) {

                    let player;
                    let opponent;
                    if (game.player1.name === name) {
                        socket.emit('construct game', `field=${game.fieldSize}` + (game.player1Turn ? " yourTurn" : ""));
                        player = game.player1;
                        opponent = game.player2;
                    } else {
                        socket.emit('construct game', `field=${game.fieldSize}` + (game.player1Turn ? "" : " yourTurn"));
                        player = game.player2;
                        opponent = game.player1;
                    }

                    if (player.name === name) { //bind new socket
                        player.socket = socket;
                    }

                    socket.emit('render ships', "player=" + player.field.coordOfAllShips);
                    socket.emit('render misses', "player=" + player.field.coordsOfAllMisses + " opponent=" + opponent.field.coordsOfAllMisses);
                    socket.emit('render hits', "player=" + player.field.coordsOfAllHits + " opponent=" + opponent.field.coordsOfAllHits);
                }

            } else {
            }
            users[name] = socket;

            //TODO: Solve case when players have the same name
            // Proposal: make a dictionary with name and id where ID will be generated automaticaly and everything will be matched to it
        });

        socket.on('chat message', function (msg) {
            io.emit('chat message', msg);
        });

        socket.on('ship', function (msg) {
            let argArray = msg.split(" ");
            let type = argArray[0];

            let coord = null;
            try {
                coord = argArray[1].split(",");

                if (coord == null || coord[0] == null || coord[1] == null) {
                    socket.emit('error', `You can not put it at this position: "${msg}"`);
                }
            } catch (e) {
                socket.emit('error', `You can not put it at this position: "${msg}"`);
            }

            let game = games[getKeyByValue(users, socket)];
            if (game == null) {
                socket.emit('error', `There is no game associated with user ${getKeyByValue(users, socket)}.`);
                return
            }

            if (socket !== null && this.player1.socket.id === socket.id) {
                if (this.player1.field.putShipToField(type, coord[0], coord[1]) === -1) {
                    socket.emit('error', `you cannot put ship ${type} on possition ${coord[0]}, ${coord[1]}.`);
                }
                socket.emit('render ships', "player=" + game.player1.field.coordOfAllShips);
            } else {
                if (this.player2.field.putShipToField(type, coord[0], coord[1]) === -1) {
                    socket.emit('error', `you cannot put ship ${type} on possition ${coord[0]}, ${coord[1]}.`);
                }
                socket.emit('render ships', "player=" + game.player2.field.coordOfAllShips);
            }
        });

        socket.on('shoot', function (msg) {

            if (!game.shipsSettled) {
                if ((game.player1.field.maxNumOfShips === game.player1.field.shipsNum)
                    && (game.player2.field.maxNumOfShips === game.player2.field.shipsNum)) {
                    game.shipsSettled = true;
                } else {
                    socket.emit('error', `First you need to create all possible ships."${msg}"`);
                    return;
                }
            }

            let coord = null;
            try {
                coord = msg.split(",");

                if (coord == null || coord[0] == null || coord[1] == null) {
                    socket.emit('error', `You can not shoot at position: "${msg}"`);
                }
            } catch (e) {
                socket.emit('error', `You can not shoot at position: "${msg}"`);
            }

            let game = games[getKeyByValue(users, socket)];
            if (game == null) {
                socket.emit('error', `There is no game associated with user ${getKeyByValue(users, socket)}.`);
                return
            }

            if (game.singleplayer) { //TODO better AI
                if (game.shoot(coord[0], coord[1], socket.id)) {
                    socket.emit('hit', `${coord[0]},${coord[1]}`);
                    let destroyed = game.checkSankShips(socket);
                    if (destroyed !== null) {
                        let coords = [];
                        destroyed.position.forEach(function (i) {
                            coords.push(i);
                        });
                        socket.emit('render ships', "opponent=" + JSON.stringify(coords));

                        end = game.checkGameWon(socket);
                        if (end) {
                            game.savePlayerStats(game.player1);
                            game.savePlayerStats(game.player2);
                        }
                    }

                } else {
                    socket.emit('miss', `${coord[0]},${coord[1]}`);
                }

                game.player1Turn = !game.player1Turn; //END of player turn

                let x = game.randomPosition
                let y = game.randomPosition
                if (game.shoot(x, y, null)) { // AI is shooting
                    socket.emit('opponent hit', `${x},${y}`);

                    let destroyed = game.checkSankShips(null);
                    if (destroyed !== null) {
                        end = game.checkGameWon(null);
                        if (end) {
                            game.savePlayerStats(game.player1);
                            game.savePlayerStats(game.player2);
                        }
                    }
                } else {
                    socket.emit('opponent miss', `${x},${y}`);
                }
                game.player1Turn = !game.player1Turn; //END of player turn
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
                        opponentSocket.emit('opponent hit', `${coord[0]},${coord[1]}`);

                        let destroyed = game.checkSankShips(socket);
                        if (destroyed !== null) {
                            let coords = [];
                            destroyed.position.forEach(function (i) {
                                coords.push(i);
                            });
                            socket.emit('render ships', "opponent=" + JSON.stringify(coords));

                            end = game.checkGameWon(socket);
                            if (end) {
                                game.savePlayerStats(game.player1);
                                game.savePlayerStats(game.player2);
                            }
                        }

                    } else {
                        socket.emit('miss', `${coord[0]},${coord[1]}`);
                        opponentSocket.emit('opponent miss', `${coord[0]},${coord[1]}`);
                    }
                    game.player1Turn = !game.player1Turn; //END of player turn

                } else {
                    socket.emit('not your turn');
                }
            }
            // socket.emit('game ended', `win`);
            // socket.emit('game ended', `loss`);
            // game.player2.socket.emit('game invite', `${game.player1.name}`);
            // TODO responses


        });

        socket.on("decline", function (name) {
            if (users[name] !== null) {
                let game = games[getKeyByValue(users, socket)];
                if (game == null) {
                    socket.emit('error', `There is no game associated with user ${name}.`);
                    return
                }

                game.player1.socket.emit('invite deleted', `Game invite was deleted. (opponent: "${game.player2.name}")`);
                delete games[game.player1.name]

                if (game.multiplayer) {
                    game.player2.socket.emit('invite deleted', `Game invite was deleted. (opponent: "${game.player1.name}")`);
                    delete games[game.player2.name]
                }

            } else {
                socket.emit('error', `There is no game associated with user ${name}.`);
            }
        });

        socket.on("accept", (name) => {
            if (users[name] !== null) {
                let game = games[getKeyByValue(users, socket)];
                if (game == null) {
                    socket.emit('error', `There is no game associated with user ${name}.`);
                    return
                }
                game.start = new Date();
                game.player1.socket.emit('construct game', `field=${game.fieldSize} yourTurn`);
                game.player2.socket.emit('construct game', `field=${game.fieldSize}`);
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

        socket.on("cancel", function removeInvite(name) {
            if (users[name] !== null) {
                let game = games[getKeyByValue(users, socket)];
                if (game == null) {
                    socket.emit('error', `There is no game associated with user ${name}.`);
                    return
                }

                game.player1.socket.emit('invite deleted', `Game invite was deleted. (opponent: "${game.player2.name}")`);
                delete games[game.player1.name]

                if (game.multiplayer) {
                    game.player2.socket.emit('invite deleted', `Game invite was deleted. (opponent: "${game.player1.name}")`);
                    delete games[game.player2.name]
                }

            } else {
                socket.emit('error', `There is no game associated with user ${name}.`);
            }
        });

        socket.on('play', function (msg) {

            let argArray = msg.split(" ");
            let fieldSize = 10;
            let opponent = null;
            for (let i in argArray) {
                let arg = argArray[i].split("=");
                if (arg[0] !== '') {
                    switch (arg[0]) {
                        case "field":
                            fieldSize = Math.max(8, Math.min(parseInt(arg[1]), 26)); // field size between 10, 25
                            break;
                        case "opponent":
                            opponent = arg[1];
                            break;
                        default:
                            socket.emit('error', `There is something wrong with argument "${argArray[i]}"`);
                            return;
                    }
                }
            }

            let username = getKeyByValue(users, socket);

            if (opponent == null) {
                let game = Game.createSingleplayer(username, socket, fieldSize);
                game.start = new Date();
                game.player1.field.randomlyFillShips()
                game.player2.field.randomlyFillShips()
                games[username] = game
                socket.emit('construct game', `field=${game.fieldSize} yourTurn`);
                socket.emit('render ships', "player=" + game.player1.field.coordOfAllShips);

            } else {
                if (opponent === username) {
                    socket.emit('error', `Playing with yourself? too easy :).`);
                    return;
                }

                let opponentSocket = users[opponent]
                if (!opponent in users || opponentSocket == null) {
                    socket.emit('error', `There is no user with nickname "${opponent}"`);
                    return;
                }

                let game = Game.createMultiplayer(getKeyByValue(users, socket), opponent, socket, opponentSocket, fieldSize);
                games[username] = game
                games[game.player2.name] = game
                socket.emit('waiting for opponent', `opponent=${game.player2.name}`);
                game.player2.socket.emit('game invite', `opponent=${game.player1.name}`);

            }
        });

        socket.on("random ships", () => {
            let username = getKeyByValue(users, socket);
            let game = games[username];

            if (game.player1.name === username) {
                game.player1.field.randomlyFillShips()
                socket.emit('render ships', "player=" + game.player1.field.coordOfAllShips);
            } else if (game.player2.name === username) {
                game.player2.field.randomlyFillShips()
                socket.emit('render ships', "player=" + game.player2.field.coordOfAllShips);

            }
        });

        socket.on('disconnect', function () {
        });
    });
}


// PlayerStats.load(game.player1.name).then(stats => {
// TODO uložení
//     stats.gamesPlayed += 1;
//
//     stats.saveStats()
// });

module.exports = server
