const jwt = require('jsonwebtoken');

const createToken = (tokenData) => {
    var token = jwt.sign(tokenData, process.env.JWT_SECRET);
    return token;
};

const verifyToken = (token) => {
    var decodedToken = jwt.verify(token,  process.env.JWT_SECRET);
    return decodedToken;
};



module.exports = {
    createToken,
    verifyToken
};
