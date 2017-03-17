const socketio      = require('socket.io');

var io = null;

exports.io = function(){
    return io;
};


exports.initialize = function(server){
    io = socketio(server);

    io.on('connection', function(socket){
        console.log('New user connected');
    });
};
