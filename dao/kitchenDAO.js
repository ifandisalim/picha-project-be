const pool = require('./pool');


const retrieve_kitchen_list = () => {
    return new Promise((resolve, reject) => {
        let retrieve_string = `
            SELECT * FROM kitchen
        `;

        pool.query(retrieve_string)
            .then(result => {
                resolve(result.rows);
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_string at retrieve_kitchen_list kitchenDAO.js"});
            });
    });
};


module.exports = {
    retrieve_kitchen_list
};
