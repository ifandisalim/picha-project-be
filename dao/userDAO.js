const jwt = require ('jsonwebtoken');
const pool = require('./pool');


const retrieveCredentials = (username, user_type) => {

    return new Promise((resolve, reject) => {
        let select_string = `
            SELECT id, password, firstname FROM users
            WHERE username = $1
            AND kitchen_id IS ${(user_type === 'operation_team' ? 'NULL' : 'NOT NULL')}
            LIMIT 1;
        `;



        pool.query(select_string, [username])
            .then((result) => {
                
                if(result.rows.length < 1){
                    return reject({daoErrMessage: "no user found"});
                }

                return resolve(result.rows[0]);
            })
            .catch((error) => {
                reject({error, daoErrMessage: "Fails select_string at retrieveCredentials userDAO.js"});
            });

    });

};


const insertOtUser = (userObj) => {

    let firstname = userObj.firstname,
        lastname = userObj.lastname,
        username = userObj.username,
        hash = userObj.hash,
        mobile_no = userObj.mobile_no;


    return new Promise((resolve, reject) => {
        let insert_string = `
            INSERT INTO users(firstname, lastname, mobile_no, username, password)
            VALUES($1, $2, $3, $4, $5)  RETURNING ID;
        `;

        pool.query(insert_string, [firstname, lastname, mobile_no, username, hash])
            .then(result => {
                resolve({user_id: result.rows[0].id, firstname});
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails insert_string at insertOtUser userDAO.js"});
            });
    });

};


const insertKtUser = (userObj) => {

    let firstname = userObj.firstname,
        lastname = userObj.lastname,
        username = userObj.username,
        hash = userObj.hash,
        mobile_no = userObj.mobile_no,
        kitchen_id = userObj.kitchen_id;


    return new Promise((resolve, reject) => {
        let insert_string = `
            INSERT INTO users(firstname, lastname, mobile_no, username, password, kitchen_id)
            VALUES($1, $2, $3, $4, $5, $6);
        `;

        pool.query(insert_string, [firstname, lastname, mobile_no, username, hash, kitchen_id])
            .then(result => {
                resolve({firstname});
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails insert_string at insertKtUser userDAO.js"});
            });
    });

};







module.exports = {
    retrieveCredentials,
    insertOtUser,
    insertKtUser
};
