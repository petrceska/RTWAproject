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
        let game = Game.createSingleplayer(getKeyByValue(users, socket), socket);

        console.log('new game!: ' + msg);
        let argArray = msg.split(" ");

        for (let i in argArray) {
            let arg = argArray[i].split("=");
            console.log(arg[0]);
            console.log(arg[1]);
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
        this.player1ShipsRemaining = this.shipsNum;
        this.player2ShipsRemaining = this.shipsNum;
    }

    set ships(num){
        this.player1ShipsRemaining = num;
        this.player2ShipsRemaining = num;
        this.shipsNum = num;
    }
}

// ---------------------------------------------------------------------------------------


const {MongoClient} = require("mongodb");

// The database to use
const dbName = "myFirstDatabase";

// Replace the following with your Atlas connection string
// mongodb+srv://<username>:<password>@<clustername>/myFirstDatabase?retryWrites=true&w=majority
const uri = `mongodb+srv://root:toor@cluster0.9qvug.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});


function gameFinished(game){
    let person = loadPerson(game.player1)
    //TODO upravit statictiky ++ try catch
    savePerson(person)
}

async function saveGame(game) {
    await client.connect();
    const db = client.db(dbName);

    // Use the collection "games"
    const col = db.collection("games");

    // Insert a single game, wait for promise so we can read it back
    const p = await col.insertOne(game);

}

async function loadGame() {
    await client.connect();
    const db = client.db(dbName);

    // Use the collection "games"
    const col = db.collection("games");

    // Find one game document
    return await col.findOne();
}
async function savePerson(person) {
    await client.connect();
    const db = client.db(dbName);

    // Use the collection "persons"
    const col = db.collection("persons");

    // Insert a single person, wait for promise so we can read it back
    const p = await col.insertOne(person);

}

async function loadPerson() {
    await client.connect();
    const db = client.db(dbName);

    // Use the collection "games"
    const col = db.collection("games");

    // Find one game document
    return await col.findOne();
}

let game = Game.createSingleplayer("testik", 'socket');
game.ships = 8;
saveGame(game)
    .catch(console.error)
    .finally(() => client.close());

let loaded = loadGame()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());
