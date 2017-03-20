const orderDAO           = require('../dao/orderDAO');
const moment             = require('moment');
const ionicPushServer    = require('ionic-push-server');

const io = require('../socket').io();
const pushCredentials = {
    IonicApplicationId : "50bbc6d4",
    IonicApplicationAPItoken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMWRlZGQ4Zi05ZjEyLTQ5OTktODg2NC00YjAwY2QwMzYyZmYifQ.GxlIUDv-maoOYg597aDsucVFeMFi2xAl92KG4Su0_E4"
};

module.exports = (req, res) => {

    let order_obj = req.body;
    order_obj.ordered_datetime = moment().format('YYYY-MM-DD HH:mm');
    order_obj.order_preferences = JSON.stringify(order_obj.order_preferences);

    let {ordered_by_firstname, due_datetime, orders, order_preferences, socketio_room, kitchen_name} = req.body;



    orderDAO.insert_order(order_obj)
        .then((result) => {


            io.to(socketio_room).to('operation_team').emit('new_order',{
                ordered_by_firstname,
                due_datetime,
                socketio_room,
                kitchen_name,
                order_preferences,
                orders
            });

            // const ionicNotifications = 
            //
            // ionicPushServer(credentials, notification);




            res.send({success: true});

        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at new_order.js orderDAO.insert_order ", error: err });
        });




};
