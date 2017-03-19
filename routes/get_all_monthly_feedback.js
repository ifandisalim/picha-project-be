const orderDAO = require('./../dao/orderDAO');
const moment   = require('moment');


module.exports = (req, res) => {

    let offset =  req.params.offset;


    orderDAO.retrieve_monthly_feedback(offset)
        .then(feedbacks => {

            // let order_ids = retrieve_order_id_from_orders(orders);

            feedbacks = feedbacks.reduce((curr_obj, feedback) => {
                curr_obj.positive_comments  = curr_obj.positive_comments || [];
                curr_obj.negative_comments  = curr_obj.negative_comments || [];

                if (feedback.is_positive){
                    curr_obj.positive_comments.push(feedback);
                    return curr_obj;
                }

                curr_obj.negative_comments.push(feedback);
                return curr_obj;

            }, {});

            feedbacks.counter = offset;
            feedbacks.month = moment().format('DD MMMM YYYY');



            //Get the menu for each order_id
            orderDAO.retrieve_monthly_feedback_is_positive()
                .then(is_positive_arr => {

                    // let orders_with_order_items = assign_order_items_to_orders(order_items, orders);
                    let is_positive_count  = is_positive_arr.reduce((curr_sum, feedback) => {
                        if(feedback.is_positive){
                             curr_sum++;
                             return curr_sum;
                        }

                        return curr_sum;
                    },0);


                    let is_positive_percent = Math.round((is_positive_count / is_positive_arr.length )*100);

                    feedbacks.monthly_positive_percentage = is_positive_percent;

                     res.send({success: true, feedback_details: feedbacks});
                    // return resolve(resObj);
                })
                .catch(err => {
                    res.status(500).send({success:false, errMessage: "Fails at get_monthly_feedback.js orderDAO.retrieve_monthly_feedback_is_positive ", error: err });
                });


        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at get_monthly_feedback.js orderDAO.retrieve_monthly_feedback ", error: err });
        });

};
