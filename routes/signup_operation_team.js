const bcrypt = require('bcryptjs');

const userDAO = require('./../dao/userDAO');
const token = require('./../dao/token');

module.exports = (req, res) => {

    var password = req.body.password;

    // Hashing password to store in DB
    bcrypt.genSalt(10, (err,salt) => {

        if(err){
            res.status(500).send({success: false, errMessage: "Fails at signup_operation_team.js bcrypt.getSalt", error: err});
            return;
        }

        bcrypt.hash(password, salt, (err, hash) => {

            if(err){
                res.status(500).send({success: false, errMessage: "Fails at signup_operation_team.js bcrypt.hash", error: err});
                return;
            }

            var userObj = Object.assign(req.body, {hash});
            userDAO.insertOtUser(userObj)
                .then((insertResponse) => {
                    var user_id = insertResponse.user_id,
                        firstname = insertResponse.firstname;
                    var access_token = token.createToken({user_id});

                    res.send({success: true, access_token, firstname});
                })
                .catch((err) => {
                    res.status(500).send({success:false, errMessage: "Fails at signup_operation_team.js userDAO.insertOtUser ", error: err });
                });

        });
    });


};
