const orderDAO      = require('../dao/orderDAO');

module.exports = (req, res) => {

    let order_id =  req.params.order_id;



    orderDAO.retrieve_feedback_id(order_id)
        .then((feedback_id) => {

            orderDAO.retrieve_feedback(feedback_id)
                .then( (feedback) => res.send({success:true, feedback}))
                .catch(err => {
                    return res.status(500).send({success:false, errMessage: "Fails at retrieve_order_feedback.js orderDAO.retrieve_feedback ", error: err });
                });
        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at retrieve_order_feedback.js orderDAO.retrieve_feedback_id ", error: err });
        });


};
