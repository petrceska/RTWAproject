import { onConnection } from './server.js';
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

let users = {};

io.on('connection', onConnection);

http.listen(3000, function () {
    console.log('listening on *:3000');
});
