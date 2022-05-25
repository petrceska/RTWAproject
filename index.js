var app = require('express')();
var http = require('http').Server(app);

require('./server.js')

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});



