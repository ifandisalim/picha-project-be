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


const retrieve_kitchen_menu_by_id = (kitchen_id) => {
    return new Promise((resolve, reject) => {
        let retrieve_string = `
            SELECT name, price, description, is_vegetarian FROM menu WHERE kitchen_id = $1
        `;

        pool.query(retrieve_string, [kitchen_id])
            .then(result => {
                if(result.rows.length < 1){
                    reject({daoErrMessage: "No menu found for this kitchen"});
                }

                resolve(result.rows);
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_string at retrieve_kitchen_menu_by_id kitchenDAO.js"});
            });
    });
};



module.exports = {
    retrieve_kitchen_list,
    retrieve_kitchen_menu_by_id
};
