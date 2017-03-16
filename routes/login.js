const userDAO = require('./../dao/userDAO');
const token = require('./../dao/token');
const bcrypt = require('bcryptjs');

module.exports = (req, res) => {

    var password        = req.body.password,
        username        = req.body.username,
        user_type       = req.body.user_type;

    userDAO.retrieveCredentials(username, user_type)
        .then(result => {
            let retrieved_password = result.password,
                user_id            = result.id,
                firstname          = result.firstname;

            bcrypt.compare(password, retrieved_password, (err, match) => {
                if(err){
                    return res.status(500).send({success: false, errMessage: "Fails at login.js bcrypt.compare", error: err});
                }

                if(!match){
                    return res.status(401).send({success: false, errMessage: "Wrong Password"});
                }

                var access_token = token.createToken({user_id});
                return res.send({success: true, access_token, firstname});
            });
        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at login.js userDAO.insertKtUser ", error: err });
        });

};
