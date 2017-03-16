const kitchenDAO = require('./../dao/kitchenDAO');


module.exports = (req, res) => {

    let kitchen_id =  req.params.kitchen_id;


    kitchenDAO.retrieve_kitchen_menu_by_id(kitchen_id)
        .then(result => {

            return res.send({success: true, menu: result});

        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at get_kitchen_menu.js kitchenDAO.retrieve_kitchen_menu_by_id ", error: err });
        });

};
