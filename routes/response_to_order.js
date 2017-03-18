const orderDAO      = require('../dao/orderDAO');
const kitchenDAO    = require('../dao/kitchenDAO');
const io        = require('../socket').io();

module.exports = (req, res) => {

    let {order_id, status, kitchen_id} = req.body;



    orderDAO.update_order_status(order_id, status)
        .then(() => {

            kitchenDAO.retrieve_kitcen_socket_room(kitchen_id)
                .then((room_name) => {
                    io.to(room_name).to('operation_team').emit('update_order_status',{
                        order_id,
                        kitchen_id,
                        status
                    });

                    res.send({success: true});

                });

        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at response_to_order.js orderDAO.update_order_status ", error: err });
        });




};
