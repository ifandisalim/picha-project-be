const userDAO = require('./../dao/userDAO');
const bcrypt = require('bcryptjs');

module.exports = (req, res) => {

    var {user_id, new_password} = req.body;

    bcrypt.genSalt(10, (err,salt) => {

        if(err){
            res.status(500).send({success: false, errMessage: "Fails at reset_password.js bcrypt.getSalt", error: err});
            return;
        }

        bcrypt.hash(new_password, salt, (err, hash) => {

            if(err){
                res.status(500).send({success: false, errMessage: "Fails at reset_password.js bcrypt.hash", error: err});
                return;
            }

            userDAO.resetPassword(user_id, hash)
                .then(() => {

                    res.send({success: true});
                })
                .catch((err) => {
                    res.status(500).send({success:false, errMessage: "Fails at signup_operation_team.js userDAO.insertOtUser ", error: err });
                });

        });
    });

};
