const kitchenDAO = require('./../dao/kitchenDAO');


module.exports = (req, res) => {

    kitchenDAO.retrieve_order_preferences()
        .then(result => {
            let preferences = result.map((preferenceObj => preferenceObj.preference));
            return res.send({success: true, order_preferences: preferences});
        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at get_order_preferences.js kitchenDAO.retrieve_order_preferences ", error: err });
        });

};
