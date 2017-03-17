const io        = require('../socket').io();


module.exports = (req, res) => {

    io.on('connection', function(socket){
        console.log('New user connected from userEvent!');

        socket.broadcast.emit('new_order', {test: 'test'});
    });

    return res.send({success: true});



};
