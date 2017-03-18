const orderDAO = require('./../dao/orderDAO');


module.exports = (req, res) => {

    let order_id =  req.params.order_id;


    orderDAO.retrieve_order_by_id(order_id)
        .then(result => {
            // console.log('RESULTL ', JSON.stringify(result, undefined, 4));
            res.send({success: true, menu: result});
        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at get_order_by_id.js orderDAO.retrieve_order_by_id ", error: err });
        });

};
