const jwt = require ('jsonwebtoken');
const pool = require('./pool');


const retrieveCredentials = (username, user_type) => {

    return new Promise((resolve, reject) => {
        let select_string = `
            SELECT id, password, firstname ${user_type === 'operation_team' ? '' : ', kitchen_id'} FROM users
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


const retrieve_room_by_user_id = (user_id) => {

    let select_string = `
        SELECT k.socketio_room
        FROM kitchen k
        JOIN users u
        ON (u.kitchen_id = k.id)
        WHERE u.id = $1 AND u.kitchen_id IS NOT NULL
        LIMIT 1
    `;

    return new Promise((resolve, reject) => {

        pool.query(select_string, [user_id])
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No kitchen room found"});
                }

                resolve(result.rows[0].socketio_room);
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails insert_string at insertKtUser userDAO.js"});
            });

    });



};


const update_push_token = (user_id, push_token) => {

    let update_push_token_string = `
        UPDATE users
        SET push_token = $1
        WHERE id = $2;
    `;


    return new Promise((resolve, reject) => {

        pool.query(update_push_token_string, [push_token, user_id])
            .then(result => {
                resolve();
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails update_push_token_string at update_push_token userDAO.js"});
            });

    });


};



const retrieve_push_token = (kitchen_id, sender_id) => {

    let retrieve_push_token_string = `
        SELECT u.push_token, u.firstname
        FROM users u
        LEFT OUTER JOIN kitchen k
        ON (u.kitchen_id = k.id)
        WHERE k.id = $1 OR u.kitchen_id IS NULL
        AND u.id <> $2
    `;

    return new Promise((resolve, reject) => {

        pool.query(retrieve_push_token_string, [kitchen_id, sender_id])
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No push token found"});
                }

                resolve(result.rows);
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_push_token_string at retrieve_push_token userDAO.js"});
            });

    });


};


const retrieve_all_ot_push_token = (sender_user_id) => {

    let retrieve_push_token_string = `
        select push_token 
        from users 
        where kitchen_id is null
        AND id <> $1
    `;

    return new Promise((resolve, reject) => {

        pool.query(retrieve_push_token_string, [sender_user_id])
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No push token found"});
                }

                resolve(result.rows);
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_push_token_string at retrieve_push_token userDAO.js"});
            });

    });

}


const retrieve_user_id = (username) => {

    let retrieve_string = `
        SELECT id FROM users
        WHERE username = $1
    `;

    return new Promise((resolve, reject) => {
        pool.query(retrieve_string, [username])
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No username found"});
                }
                console.log(result);
                resolve(result.rows[0].id);
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_string at retrieve_user_id userDAO.js"});
            });
    });

};


const resetPassword = (user_id, new_password) => {

    console.log(user_id);
    console.log(new_password);

    let update_string = `
        UPDATE users
        SET password = $1
        WHERE id = $2
    `;


    return new Promise((resolve, reject) => {
        pool.query(update_string, [new_password, user_id])
            .then(result => {
                resolve();
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails update_string at resetPassword userDAO.js"});
            });
    });

};





module.exports = {
    retrieveCredentials,
    insertOtUser,
    insertKtUser,
    retrieve_room_by_user_id,
    update_push_token,
    retrieve_push_token,
    retrieve_all_ot_push_token,
    retrieve_user_id,
    resetPassword

};
