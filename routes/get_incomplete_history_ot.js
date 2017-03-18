const orderDAO = require('./../dao/orderDAO');


module.exports = (req, res) => {

    let offset =  req.params.offset;


    orderDAO.retrieve_order_by_offset(offset, false)
        .then(orders => {

            let order_ids = [];

            // Get all order_ids into array
            for(let i=0; i<orders.length; i++){
                order_ids.push(orders[i].order_id);
            }


            //Get the menu for each order_id
            orderDAO.retrieve_order_items_by_multiple_id(order_ids)
                .then(order_items => {


                    // Assign each menu to respective order based on menu's order_id
                    let order_items_by_order_id = order_items.reduce((currentObj, order) => {
                        let {order_id, menu_name, quantity} = order;
                        currentObj[order_id] = currentObj[order_id] || [];

                        currentObj[order_id].push({menu_name, quantity});
                        return currentObj;
                    }, {});

                    let orders_with_order_items = orders.map((order) => {
                        order.orders = order_items_by_order_id[order.order_id];
                        return order;
                    });

                    res.send({success: true, order_history: orders_with_order_items});
                    // return resolve(resObj);
                })
                .catch(err => {
                    res.status(500).send({success:false, errMessage: "Fails at get_completed_history_ot.js orderDAO.retrieve_order_items_by_multiple_id ", error: err });
                });


        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at get_completed_history_ot.js orderDAO.retrieve_completed_order_ot ", error: err });
        });

};
