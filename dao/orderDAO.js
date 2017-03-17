const pool      = require('./pool');



const insert_order = (order_obj) => {
    let {ordered_datetime, due_datetime, status, total_price, ordered_by_id, kitchen_id, order_preferences} = order_obj;

    return new Promise((resolve, reject) => {
        let insert_string = `
            INSERT INTO orders  (ordered_datetime, due_datetime, status, total_price, ordered_by_id, kitchen_id, preferences)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ID
        `;

        // Insert new Order and get the inserted order id
        pool.query(insert_string, [ordered_datetime, due_datetime, 'PENDING APPROVAL', total_price, ordered_by_id, kitchen_id, order_preferences ])
            .then(result => {
                let order_id = result.rows[0].id;
                let {orders} = order_obj;

                // Insert individual order items
                insert_menu_items(orders, order_id)
                    .then(() => {
                        resolve({order_id});
                    });

            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails insert_string at insert_order orderDAO.js"});
            });
    });

};

// Private function to insert individual order items 
insert_menu_items = (orders, order_id) => {

    return new Promise((resolve, reject) => {

        let insert_order_item_string = `INSERT INTO order_items (quantity, menu_id, order_id)
            VALUES `;

        // Create insert string for menu_items using loop
        for(let i=0; i<orders.length; i++){
            insert_order_item_string += `(${orders[i].quantity}, ${orders[i].menu_id}, ${order_id}),`;
        }

        // Remove trailing ,
        insert_order_item_string = insert_order_item_string.slice(0, -1);

        // Insert menu items of the order
        pool.query(insert_order_item_string)
            .then(result => {
                return resolve();
            })
            .catch(error => {
                return reject({error, daoErrMessage: "Fails insert_order_item_string at insert_menu_items orderDAO.js"});
            });

    });

};


module.exports = {
    insert_order
};
