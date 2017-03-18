const orderDAO      = require('../dao/orderDAO');
const kitchenDAO    = require('../dao/kitchenDAO');
const io        = require('../socket').io();

module.exports = (req, res) => {

    let {order_id, is_positive, comment, input_by_firstname} = req.body;



    orderDAO.insert_order_feedback(order_id, is_positive, comment, input_by_firstname)
        .then((feedback_id) => {

            orderDAO.insert_feedback_id_to_order(feedback_id, order_id)
                .then( () => res.send({success:true}))
                .catch(err => {
                    return res.status(500).send({success:false, errMessage: "Fails at insert_order_feedback.js orderDAO.insert_feedback_id_to_order ", error: err });
                });
        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at insert_order_feedback.js orderDAO.insert_order_feedback ", error: err });
        });


};
