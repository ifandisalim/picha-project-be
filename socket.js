const socketio      = require('socket.io');

const userDAO = require('./dao/userDAO');
var io = null;
var connected_sockets = [];

// Export method to retrieve io
exports.io = function(){
    return io;
};

exports.connected_sockets = function(){
    return connected_sockets;
};



exports.initialize = function(server){
    // Initialize io
    io = socketio(server);

    io.on('connection', function(socket){
        console.log('New user connected');


        // Join operation room
        socket.on('join_operation_room', (user_id, callback) => {

                // Retrieve room name and join them.
                // Push socket with its user id to connected sockets
                socket.join('operation_team');
                connected_sockets.push({user_id, socket});
                callback();

        });



        // Kitchen user join room
        socket.on('join_kitchen_room', (user_id, callback) => {
            userDAO.retrieve_room_by_user_id(user_id)
                .then(room_name => {

                    // Retrieve room name and join them.
                    // Push socket with its user id to connected sockets
                    socket.join(room_name);
                    connected_sockets.push({user_id, socket});
                    callback();

                })
                .catch(err => {
                    callback({success:false, errMessage: "Fails at socket.js join_kitchen_room event ", error: err });
                });
        });



    });
};
