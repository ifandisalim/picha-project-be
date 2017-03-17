const orderDAO      = require('../dao/orderDAO');
const moment        = require('moment');

module.exports = (req, res) => {

    let order_obj = req.body;
    order_obj.ordered_datetime = moment().format('YYYY-MM-DD HH:mm');
    order_obj.order_preferences = JSON.stringify(order_obj.order_preferences);


    orderDAO.insert_order(order_obj)
        .then(() => {
            res.send({success: true});
        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at new_order.js orderDAO.insert_order ", error: err });
        });




};
