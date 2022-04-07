var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

let users = {};

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on("it's me", (name)=>{
    if (users[name]!=null){
      console.log('returning user: ' + name+ ' (after a client refresh). Welcome back!');
    } else {
      console.log('new user by the name of: ' + name);
    }
    users[name]=socket;
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});