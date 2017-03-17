const orderDAO      = require('../dao/orderDAO');
const moment        = require('moment');

const socket        = require('../socket').io();

module.exports = (req, res) => {

    let order_obj = req.body;
    order_obj.ordered_datetime = moment().format('YYYY-MM-DD HH:mm');
    order_obj.order_preferences = JSON.stringify(order_obj.order_preferences);

    let {ordered_by_firstname, due_datetime, orders, order_preferences, socketio_room, kitchen_name} = req.body;



    orderDAO.insert_order(order_obj)
        .then((result) => {


            // socket.to(socketio_room).emit('new_order',{
            //     ordered_by_firstname,
            //     due_datetime,
            //     socketio_room,
            //     kitchen_name,
            //     order_preferences,
            //     orders
            // });

            socket.emit('new_order',{
                ordered_by_firstname,
                due_datetime,
                socketio_room,
                kitchen_name,
                order_preferences,
                orders
            });


            res.send({success: true});

        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at new_order.js orderDAO.insert_order ", error: err });
        });




};
