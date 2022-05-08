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

    socket.on('play', function (msg) {
        let game = Game.createSingleplayer(users.findIndex(socket));

        console.log('new game!: ' + msg);
        let argArray = msg.split(" ");

        for (let i in argArray) {
            let arg = argArray[i].split("=");
            switch (arg[0]) {
                case "field":
                    console.log(arg[1]);
                    game.field_size = parseInt(arg[1]);
                    break;
                case "ships":
                    console.log(arg[1]);
                    game.ships_num = parseInt(arg[1]);
                    break;
                default:
                    socket.emit('wrong parameters', `There is something wrong with argument "${argArray[i]}"`);
                    break;
            }

        }

    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

class Game {
    static createSingleplayer(player) {
        return new Game(player, "Jack Sparrow", false);
    }

    static createMultiplayer(player1, player2) {
        return new Book(player1, player2, true);
    }

    constructor(player1, player2, type) {
        this.player1 = player1;
        this.player2 = player2;
        this.multiplayer = type;
        this.singleplayer = !type;
        this.field_size = 10;
        this.ships_num = 6;
    }
}