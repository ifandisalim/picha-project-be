
const token = require('./../dao/token');

//middleware to authenticate
// this middleware can be used by other route app.get('/route', authenticate, (req, res))
var authenticate = (req,res,next) => {

    req.tokenRefreshed = false;

    // Get token from header
    var access_token = req.header('access_token');
    var decoded_token = {};

    if(!access_token){
        res.status(401).send({success: false, errMessage: "Token Does Not Exist"});
        return;
    }

    try{
        decoded_token = token.verifyToken(access_token);
    }
    catch(err){
        if(err.name === 'TokenExpiredError'){
            res.status(401).send({success: false, errMessage: "Expired Token", error: err});
            return;
        }

        res.status(401).send({success: false, errMessage: "Fails at authenticate.js try decoded_token", error: err});
        return;

    }


    req.user_id = decoded_token.user_id;

    return next();


};

module.exports = authenticate;
