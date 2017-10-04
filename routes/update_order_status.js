const orderDAO      = require('../dao/orderDAO');
const kitchenDAO    = require('../dao/kitchenDAO');
const userDAO       = require('../dao/userDAO');
const io        = require('../socket').io();
const ionicPushServer    = require('ionic-push-server');
const moment        = require('moment');

const notificationCred   = require('../notification');
module.exports = (req, res) => {

    let {order, status, kitchen_id} = req.body;
    let {order_id, kitchen_name, due_datetime} = order;
    let moment_datetime = moment(due_datetime);
    let formatted_datetime = moment_datetime.format('DD MMM YYYY h:mm A');
    let user_id = req.user_id;
    let rejected_reason = req.body.rejected_reason || null;



    orderDAO.update_order_status(order_id, status, rejected_reason)
        .then(() => {

            kitchenDAO.retrieve_kitcen_socket_room(kitchen_id)
                .then((room_name) => {

                    userDAO.retrieve_push_token(kitchen_id,user_id )
                        .then(results => {

                            push_tokens = results.map((single_result) => {
                                return single_result.push_token;
                            })
                            .filter(push_token => {
                                return (push_token && push_token !== null && push_token !== '');
                            });

                            let notificationMessage = (
                                status !== 'REJECTED' ? 
                                `Order for ${kitchen_name} at ${formatted_datetime} status changed to ${status} ` 
                                : `Order for ${kitchen_name} at ${formatted_datetime} status changed to ${status}. Reason: ${rejected_reason}`
                            );

                            const ionicNotifications = {
                                "tokens": push_tokens,
                                "profile": "dev",
                                "notification": {
                                    "title": "Order Status Update",
                                    "message": notificationMessage
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
