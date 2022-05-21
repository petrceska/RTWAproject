var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

let users = {};

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

http.listen(3000, function () {
    console.log('listening on *:3000');
});


function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

class Game {
    static createSingleplayer(player, socket) {
        return new Game(player, "AI", socket, null, false);
    }

    static createMultiplayer(player1, player2, socket1) {
        return new Book(player1, player2, socket1, users[player2], true);
    }

    constructor(player1, player2, socket1, socket2, type) {
        this.player1 = player1;
        this.player2 = player2;
        this.multiplayer = type;
        this.singleplayer = !type;
        this.fieldSize = 10;
        this.shipsNum = 6;
        this.player1Socket = socket1;
        this.player2Socket = socket2;
    }
}