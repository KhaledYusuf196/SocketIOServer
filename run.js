const io = require('socket.io')(3004);

const Player = require('./Player');

console.log('Server Created');

const players = {};
const sockets = {};

io.on('connection', (socket) => {
    console.log('Client Connected');
    const newplayer = new Player();
    players[newplayer.id] = newplayer;
    sockets[newplayer.id] = socket;
    socket.on('setName', (data) => {
        newplayer.playerName = data.playerName;
        console.log(players[newplayer.id].playerName);
        socket.emit('registered',{PlayerId: newplayer.id, Players:players});
        socket.broadcast.emit('newPlayer', {PlayerData: newplayer})
    })
    
    socket.on('disconnect', (reason) => {
        console.log("client " + socket.id + " has disconnected. Reason: " + reason);
        delete players[newplayer.id];
        delete sockets[newplayer.id];
        socket.broadcast.emit('removePlayer', { PlayerId: newplayer.id});
    });
});