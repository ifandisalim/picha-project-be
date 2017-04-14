const orderDAO           = require('../dao/orderDAO');
const userDAO            = require('../dao/userDAO');
const moment             = require('moment');
const ionicPushServer    = require('ionic-push-server');

const notificationCred   = require('../notification');
const io = require('../socket').io();

module.exports = (req, res) => {

    let user_id = req.user_id;

    let order_obj = req.body;
    order_obj.ordered_datetime = moment().format('YYYY-MM-DD HH:mm');
    order_obj.order_preferences = JSON.stringify(order_obj.order_preferences);

    let {ordered_by_firstname, due_datetime, orders, order_preferences, socketio_room, kitchen_name, kitchen_id} = req.body;



    orderDAO.insert_order(order_obj)
        .then((result) => {


            // io.to(socketio_room).to('operation_team').emit('new_order',{
            //     ordered_by_firstname,
            //     due_datetime,
            //     socketio_room,
            //     kitchen_name,
            //     order_preferences,
            //     orders
            // });

            userDAO.retrieve_push_token(kitchen_id, user_id)
                .then(results => {

                    push_tokens = results.map((single_result) => {
                        return single_result.push_token;
                    })
                    .filter(push_token => {
                        return (push_token && push_token !== null && push_token !== '');
                    });

                    const ionicNotifications = {
                        "tokens": push_tokens,
                        "profile": "dev",
                        "notification": {
                            "title": "New Order",
                            "message": `New order for ${kitchen_name}. Due ${due_datetime}`
                        }

                    };


                    res.send({success: true});
                    ionicPushServer(notificationCred.pushCredentials, ionicNotifications);


                })
                .catch(err => {
                    res.status(500).send({success:false, errMessage: "Fails at new_order.js userDAO.retrieve_push_token ", error: err });
                });



        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at new_order.js orderDAO.insert_order ", error: err });
        });




};
