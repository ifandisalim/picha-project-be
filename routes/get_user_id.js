const userDAO = require('./../dao/userDAO');

module.exports = (req, res) => {

    var username = req.body.username;

    userDAO.retrieve_user_id(username)
        .then(user_id => {
            return res.send({success: true, user_id});
        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at login.js userDAO.insertKtUser ", error: err });
        });

};
