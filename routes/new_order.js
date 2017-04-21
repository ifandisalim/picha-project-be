const orderDAO           = require('../dao/orderDAO');
const userDAO            = require('../dao/userDAO');
const moment             = require('moment');
const ionicPushServer    = require('ionic-push-server');

const notification   = require('../notification');
const io = require('../socket').io();
const scheduler = require('../scheduler');

module.exports = (req, res) => {

    let user_id = req.user_id;

    let order_obj = req.body;
    order_obj.ordered_datetime = moment().format('YYYY-MM-DD HH:mm');
    order_obj.order_preferences = JSON.stringify(order_obj.order_preferences);

    let {ordered_by_firstname, due_datetime, orders, order_preferences, socketio_room, kitchen_name, kitchen_id} = req.body;
    let moment_due_datetime = moment(due_datetime)
    let formatted_due_datetime = moment_due_datetime.format('D MMM YYYY h:mm A');




    orderDAO.insert_order(order_obj)
        .then((result) => {

            let {order_id} = result;

            userDAO.retrieve_push_token(kitchen_id, user_id)
                .then(results => {

                    /**
                     * Sending new order notification
                     */
                    let push_tokens = map_push_tokens(results);
                    let notification_message = `New order for ${kitchen_name}. Due ${formatted_due_datetime}`;
                    const newOrderNotification = notification.construct(push_tokens, "New Order", notification_message);

                    // Send new order notification
                    ionicPushServer(notification.pushCredentials, newOrderNotification);

                    
                    userDAO.retrieve_push_token_reminder(kitchen_id)
                        .then(result => {
                            let push_tokens = map_push_tokens(results);


                            // Schedule for notification 15 minutes after
                            let post_due_reminder_msg = `15 minutes passed for order ${kitchen_name}. Due ${formatted_due_datetime}. Order is not set to picked up yet.`;
                            const post_due_notification = notification.construct(push_tokens, "Time is up!", post_due_reminder_msg);

                           
                            let schedule_post_due = scheduler.shcedule_post_order_reminder(moment_due_datetime, () => {
                                        orderDAO.retrieve_order_status(order_id)
                                        .then(status => {
                                            if(status !== 'PICKED UP'){
                                                schedule.cancel();
                                                return;
                                            }
                                            
                                        ionicPushServer(notification.pushCredentials, post_due_notification);
                                        schedule_post_due.cancel();
                                        });
                            });


                            // Schedule for notification 15 minutes before
                            let pre_due_reminder_msg = `Reminder order for ${kitchen_name}. Due in 15 minutes`;
                            const pre_due_notification = notification.construct(push_tokens, "Reminder", pre_due_reminder_msg);
                            let schedule_pre_due = scheduler.schedule_pre_order_reminder(moment_due_datetime, () => {
                                ionicPushServer(notification.pushCredentials, pre_due_notification);
                                schedule_pre_due.cancel();
                            });

                            // Schedule for notification day before at 15:00
                            let day_before_reminder_msg = `Reminder next day order for ${kitchen_name}. Due ${formatted_due_datetime}`;
                            const day_before_notification = notification.construct(push_tokens, "Reminder", day_before_reminder_msg);

                            let schedule_day_before = scheduler.schedule_day_before_reminder(moment_due_datetime, () => {
                                ionicPushServer(notification.pushCredentials, day_before_notification);
                                schedule_day_before.cancel();
                            });


                            res.send({success: true});

                        })
                        .catch(err => {
                            res.status(500).send({success:false, errMessage: "Fails at new_order.js userDAO.retrieve_push_token_reminder ", error: err });
                        });

                })
                .catch(err => {
                    res.status(500).send({success:false, errMessage: "Fails at new_order.js userDAO.retrieve_push_token ", error: err });
                });



        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at new_order.js orderDAO.insert_order ", error: err });
        });




};



/**
 * Function to format [{firstname, push_token}] into [push_token1, push_token2]
 * Removes any null push_token
 * 
 * Argument [{firstname, push_token}] Rows returned from DB query
 * Returns [push_token1, push_token2] Array of push_token string
 */
const map_push_tokens = (db_rows) => {
    return db_rows.map(row => row.push_token)
                  .filter(push_token => (push_token && push_token !== null && push_token !== '') );

}
