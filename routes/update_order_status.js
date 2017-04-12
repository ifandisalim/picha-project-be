const orderDAO      = require('../dao/orderDAO');
const kitchenDAO    = require('../dao/kitchenDAO');
const userDAO       = require('../dao/userDAO');
const io        = require('../socket').io();
const ionicPushServer    = require('ionic-push-server');

const notificationCred   = require('../notification');
module.exports = (req, res) => {

    let {order_id, status, kitchen_id} = req.body;
    let rejected_reason = req.body.rejected_reason || null;



    orderDAO.update_order_status(order_id, status, rejected_reason)
        .then(() => {

            kitchenDAO.retrieve_kitcen_socket_room(kitchen_id)
                .then((room_name) => {

                    io.to(room_name).to('operation_team').emit('update_order_status',{
                        order_id,
                        kitchen_id,
                        status
                    });


                    userDAO.retrieve_push_token(kitchen_id)
                        .then(results => {

                            push_tokens = results.map((single_result) => {
                                return single_result.push_token;
                            });

                            const ionicNotifications = {
                                "tokens": push_tokens,
                                "profile": "dev",
                                "notification": {
                                    "title": "Order Status Update",
                                    "message": `Order ID ${order_id} status changed to ${status}`
                                }

                            };

                            ionicPushServer(notificationCred.pushCredentials, ionicNotifications);

                        })
                        .catch(err => {
                            res.status(500).send({success:false, errMessage: "Fails at new_order.js userDAO.retrieve_push_token ", error: err });
                        });


                    res.send({success: true});

                });

        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at response_to_order.js orderDAO.update_order_status ", error: err });
        });




};
