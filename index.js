const express = require("express");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('./server')(io);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + 'public/index.html');
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});



