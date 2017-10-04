const userDAO = require('./../dao/userDAO');

module.exports = (req, res) => {

    var push_token        = req.body.push_token,
        user_id           = req.user_id;

    userDAO.update_push_token(user_id, push_token)
        .then(() => {
            return res.send({success: true});
        })
        .catch(err => {
            res.status(500).send({success:false, errMessage: "Fails at manage_push_token.js userDAO.update_push_token ", error: err });
        });

};
