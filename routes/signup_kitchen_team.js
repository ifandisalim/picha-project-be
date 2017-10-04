const bcrypt = require('bcryptjs');

const userDAO = require('./../dao/userDAO');
const token = require('./../dao/token');

module.exports = (req, res) => {

    var password = req.body.password;

    // Hashing password to store in DB
    bcrypt.genSalt(10, (err,salt) => {

        if(err){
            res.status(500).send({success: false, errMessage: "Fails at signup_kitchen_team.js bcrypt.getSalt", error: err});
            return;
        }

        bcrypt.hash(password, salt, (err, hash) => {

            if(err){
                res.status(500).send({success: false, errMessage: "Fails at signup_kitchen_team.js bcrypt.hash", error: err});
                return;
            }

            var userObj = Object.assign(req.body, {hash});
            userDAO.insertKtUser(userObj)
                .then((insertResponse) => {

                    var firstname = insertResponse.firstname;

                    res.send({success: true, firstname});
                })
                .catch((err) => {
                    res.status(500).send({success:false, errMessage: "Fails at signup_kitchen_team.js userDAO.insertKtUser ", error: err });
                });

        });
    });


};
