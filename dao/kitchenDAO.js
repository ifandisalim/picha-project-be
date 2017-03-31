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
            SELECT id, name, price, description, is_vegetarian FROM menu WHERE kitchen_id = $1
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


const retrieve_order_preferences = () => {
    return new Promise((resolve, reject) => {
        let retrieve_string = `
            SELECT preference FROM order_preferences
        `;

        pool.query(retrieve_string)
            .then(result => {
                if(result.rows.length < 1){
                    reject({daoErrMessage: "No preferences found"});
                }

                resolve(result.rows);
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_string at retrieve_order_preferences kitchenDAO.js"});
            });
    });
};


const retrieve_kitcen_socket_room = (kitchen_id) => {
    return new Promise((resolve, reject) => {
        let retrieve_string = `
            SELECT socketio_room FROM kitchen WHERE id = $1;
        `;

        pool.query(retrieve_string, [kitchen_id])
            .then(result => {
                if(result.rows.length < 1){
                    reject({daoErrMessage: "No room found"});
                }

                resolve(result.rows[0].socketio_room);
            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_string at retrieve_kitcen_socket_room kitchenDAO.js"});
            });
    });
};




module.exports = {
    retrieve_kitchen_list,
    retrieve_kitchen_menu_by_id,
    retrieve_order_preferences,
    retrieve_kitcen_socket_room
};
