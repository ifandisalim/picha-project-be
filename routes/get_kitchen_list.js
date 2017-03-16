const kitchenDAO = require('./../dao/kitchenDAO');


module.exports = (req, res) => {


    kitchenDAO.retrieve_kitchen_list()
        .then(result => {

            let kitchen_list = result.map((kitchen) => {
                return {
                    kitchen_id: kitchen.id,
                    kitchen_name: kitchen.name,
                    socketio_room: kitchen.socketio_room
                };
            });

            return res.send({success: true, kitchen_list});

        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at get_kitchen_list.js kitchenDAO.retrieve_kitchen_list ", error: err });
        });

};
