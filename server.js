const Game = require("./game.js");
let users = [];
let games = [];

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function server(io) {
    io.on('connection', function (socket) {
        console.log('a user connected');

        socket.on("it's me", (name) => {
            if (users[name] != null) {
                console.log('returning user: ' + name + ' (after a client refresh). Welcome back!');
            } else {
                console.log('new user by the name of: ' + name);
            }
            users[name] = socket;
        });

        socket.on('chat message', function (msg) {
            console.log('message: ' + msg);
            io.emit('chat message', msg);
        });

        socket.on('shoot', function (msg) {

            console.log(row, ".", col)
        });

        socket.on('play', function (msg) {

            console.log('new game!: ' + msg);
            let argArray = msg.split(" ");
            console.log(argArray)
            let fieldSize = null;
            let shipsNum = null;
            let opponent = null;
            for (let i in argArray) {
                let arg = argArray[i].split("=");
                if (arg[0] !== '') {
                    switch (arg[0]) {
                        case "field":
                            console.log(arg[1]);
                            fieldSize = parseInt(arg[1]);
                            break;
                        case "ships":
                            console.log(arg[1]);
                            shipsNum = parseInt(arg[1]);
                            break;
                        case "opponent":
                            console.log(arg[1]);
                            opponent = arg[1];
                            break;
                        default:
                            console.log("emit");
                            socket.emit('wrong parameters', `There is something wrong with argument "${argArray[i]}"`);
                            return;
                    }
                }
            }

            if (opponent == null) {
                let game = Game.createSingleplayer(getKeyByValue(users, socket), socket);
                game.ships = shipsNum
                game.field = fieldSize
                games.push(game)
                socket.emit('construct game', `field=${game.fieldSize} ships=${game.shipsNum}`);

            } else {
                if (!opponent in users) {
                    socket.emit('wrong parameters', `There is no user with nickname "${opponent}"`);
                }

                let game = Game.createMultiplayer(getKeyByValue(users, socket), socket, opponent);
                socket.emit('waiting for opponent', `opponent=${game.player1.name}`);
                game.player2.socket.emit('game invite', `opponent=${game.player1.name}`);
            }
        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}

module.exports = server
