const io = require('socket.io')(3004);

const Player = require('./Player');

console.log('Server Created');

const players = {};
const sockets = {};
const moves = [];

function gameEnd(player1, player2, winner){
    if(winner == 0){
        sockets[player1.PlayerId].emit("Draw", {myMove: player1.Move, otherMove: player2.Move});
        sockets[player2.PlayerId].emit("Draw", {myMove: player2.Move, otherMove: player1.Move});
    }
    if(winner == 1){
        sockets[player1.PlayerId].emit("Win", {myMove: player1.Move, otherMove: player2.Move});
        sockets[player2.PlayerId].emit("Lose", {myMove: player2.Move, otherMove: player1.Move});
    }
    if(winner == 2){
        sockets[player1.PlayerId].emit("Lose", {myMove: player1.Move, otherMove: player2.Move});
        sockets[player2.PlayerId].emit("Win", {myMove: player2.Move, otherMove: player1.Move});
    }

}

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
    });

    socket.on('setMove', (data) =>{
        moves.push({ Move :data.Move, PlayerId: newplayer.id});
        console.log(moves);
        socket.emit('disableControls');
        if(moves.length >= 2){
            switch (moves[0].Move){
                case '1':
                    if(moves[1].Move == '1'){
                        console.log("Draw");
                        gameEnd(moves[0], moves[1],0);
                    }
                    if(moves[1].Move == '2'){
                        console.log(players[moves[1].PlayerId].playerName + " is winner");
                        gameEnd(moves[0], moves[1],2);
                    }
                    if(moves[1].Move == '3'){
                        console.log(players[moves[0].PlayerId].playerName + " is winner");
                        gameEnd(moves[0], moves[1],1);
                    }
                    break;
                case '2':
                    if(moves[1].Move == '1'){
                        console.log(players[moves[0].PlayerId].playerName + " is winner");
                        gameEnd(moves[0], moves[1],1);
                    }
                    if(moves[1].Move == '2'){
                        console.log("Draw");
                        gameEnd(moves[0], moves[1],0);
                        
                    }
                    if(moves[1].Move == '3'){
                        console.log(players[moves[1].PlayerId].playerName + " is winner");
                        gameEnd(moves[0], moves[1],2);
                    }
                    break;
                case '3':
                    if(moves[1].Move == '1'){
                        console.log(players[moves[1].PlayerId].playerName + " is winner");
                        gameEnd(moves[0], moves[1],2);
                    }
                    if(moves[1].Move == '2'){
                        console.log(players[moves[0].PlayerId].playerName + " is winner");
                        gameEnd(moves[0], moves[1],1);
                    }
                    if(moves[1].Move == '3'){
                        console.log("Draw"); 
                        gameEnd(moves[0], moves[1],0);
                    }
                    break;
            }
            moves.pop();
            moves.pop();
        }
    });
    
    socket.on('disconnect', (reason) => {
        console.log("client " + socket.id + " has disconnected. Reason: " + reason);
        delete players[newplayer.id];
        delete sockets[newplayer.id];
        for(var i = 0; i < moves.length; i++){
            if(moves[i].PlayerId == newplayer.id){
                moves.pop();
            }
        }
        socket.broadcast.emit('removePlayer', { PlayerId: newplayer.id});
    });
});