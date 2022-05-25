const Game = require("./game.js");
let users = {};

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
            let [row, col] = msg.split(",");
            console.log(row, ".", col)
        });

        socket.on('play', function (msg) {
            let game = Game.createSingleplayer(getKeyByValue(users,socket), socket);

            console.log('new game!: ' + msg);
            let argArray = msg.split(" ");
            console.log(argArray)

            for (let i in argArray) {
                let arg = argArray[i].split("=");
                if(arg[0] !== ''){
                    switch (arg[0]) {
                        case "field":
                            console.log(arg[1]);
                            game.fieldSize = parseInt(arg[1]);
                            break;
                        case "ships":
                            console.log(arg[1]);
                            game.shipsNum = parseInt(arg[1]);
                            break;
                        // TODO add case: opponent for multi
                        default:
                            console.log("emit");
                            socket.emit('wrong parameters', `There is something wrong with argument "${argArray[i]}"`);
                            return;
                    }
                }
            }

            socket.emit('construct game', `field=${game.fieldSize} ships=123456`);
        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}
module.exports = server
