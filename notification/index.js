const pushCredentials = {
    IonicApplicationId : "ce454bea",
    IonicApplicationAPItoken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNTRiMWFmYS0yNDUzLTRlMGItODY3Zi1lNTVkNGNhOWZjODkifQ.rJ_GLwbvleaIgwoCXOPM4dLedZK36Uy32HrrvhSGvpw"
};

/**
 * Function which constructs notification object to be sent by ionicPushServer()
 * Args:    
 *      1. Array of push_token string to send
 *      2. Notification title
 *      3. Notification message
 * 
 * Return ionicNotification object used by ionicPushServer()
 */
 const constructNotification = (push_tokens, title, message) => {
    return {
        "tokens": push_tokens,
        "profile": "dev",
        "notification": {
            "title": title,
            "message": message
        }
    }
 };

module.exports = {
    pushCredentials,
    construct: constructNotification
};
