const pool      = require('./pool');
const moment    = require('moment');


/**
 * Function to insert a new order onto database 
 * Arguments: 
 *      1. {ordered_datetime, due_datetime, status, total_price, ordered_by_id, kitchen_id, order_preferences}
 * 
 * Return a promise:
 *      1. {order_id} on resolve()
 *      2. {error, daoErrMessage} fron reject()
 *          error property is err obj from DB
 */
const insert_order = (order_obj) => {
    let {ordered_datetime, due_datetime, status, total_price, ordered_by_id, kitchen_id, order_preferences} = order_obj;

    return new Promise((resolve, reject) => {
        let insert_string = `
            INSERT INTO orders  (ordered_datetime, due_datetime, status, total_price, ordered_by_id, kitchen_id, preferences)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ID
        `;

        // Insert new Order and get the inserted order id
        pool.query(insert_string, [ordered_datetime, due_datetime, 'PENDING ACCEPTANCE', total_price, ordered_by_id, kitchen_id, order_preferences ])
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



const retrieve_order_by_id = (order_id) => {
    return new Promise((resolve, reject) => {


        let retrieve_order_string = `
            select k.name as kitchen_name, u.firstname as ordered_by_firstname, o.due_datetime::text, o.preferences, o.rejected_reason
            FROM orders o
            JOIN kitchen k
            ON (o.kitchen_id = k.id)
            JOIN users u
            ON (o.ordered_by_id = u.id)
            WHERE o.id = $1
        `;


        pool.query(retrieve_order_string, [order_id])
            .then(result => {

                if(result.rows.length < 1){
                    reject({daoErrMessage: "No order found for this id"});
                }

                let resObj = result.rows[0];


                retrieve_order_items_by_id(order_id)
                    .then(result => {

                        resObj.orders = result.orders;
                        resObj.is_positive = null;
                        resObj.comments = null;
                        resObj.input_by_firstname = null;

                        retrieve_feedback_by_order(order_id)
                            .then(result => {


                                let feedback = result[0];

                                resObj.is_positive = feedback.is_positive;
                                resObj.comments = feedback.comments;
                                resObj.input_by_firstname = feedback.input_by_firstname;

                                resolve(resObj);
                            })
                            .catch(error => {

                                if(error.daoErrMessage === 'No feedback found'){
                                    resolve(resObj);
                                }

                                return reject({error, daoErrMessage: "Fails at retrieve_feedback_by_order orderDAO.js"});
                            });


                    })
                    .catch(error => {
                        return reject({error, daoErrMessage: "Fails at retrieve_order_items_by_id orderDAO.js"});
                    });

            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_string at retrieve_kitchen_menu_by_id orderDAO.js"});
            });
    });
};


const retrieve_order_by_offset = (offset, isCompleted, kitchen_id) => {


    return new Promise((resolve, reject) => {
        let retrieve_string = `
            select o.id as order_id, k.name as kitchen_name, u.firstname as ordered_by_firstname, o.due_datetime::text, o.status, o.feedback_id
            FROM orders o
            JOIN kitchen k
            ON (o.kitchen_id = k.id)
            JOIN users u
            ON (o.ordered_by_id = u.id)
            WHERE (o.status ${isCompleted ? " = 'PICKED UP'   OR o.status = 'REJECTED' " : " != 'PICKED UP'   AND o.status != 'REJECTED'" } )
            ${isCompleted ? "" : "AND due_datetime > now()"}
            ${kitchen_id ? "AND o.status != 'PENDING ACCEPTANCE'": ""}
            ${kitchen_id ?  "AND k.id ="+kitchen_id : ""}
            ORDER BY o.due_datetime DESC
            OFFSET $1
            LIMIT 10;
        `;

        pool.query(retrieve_string, [offset])
            .then(result => {
                if(result.rows.length < 1){
                    reject({daoErrMessage: "No order found"});
                }

                let order_array = result.rows;

                // Return list of orders limited to 10
                resolve(order_array);

            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_string at retrieve_order_by_offset orderDAO.js"});
            });

    });

};




const retrieve_new_kitchen_order = (kitchen_id) => {

    return new Promise((resolve, reject) => {
        let retrieve_string = `
            select o.id as order_id, k.name as kitchen_name, u.firstname as ordered_by_firstname, o.due_datetime::text, o.status, o.feedback_id
            FROM orders o
            JOIN kitchen k
            ON (o.kitchen_id = k.id)
            JOIN users u
            ON (o.ordered_by_id = u.id)
            WHERE o.status = 'PENDING ACCEPTANCE'
            AND k.id = ${kitchen_id}
        `;


        pool.query(retrieve_string)
            .then(result => {
                if(result.rows.length < 1){
                    reject({daoErrMessage: "No order found"});
                }

                let order_array = result.rows;

                // Return list of orders limited to 10
                resolve(order_array);

            })
            .catch(error =>{
                reject({error, daoErrMessage: "Fails retrieve_string at retrieve_new_kitchen_order orderDAO.js"});
            });

    });

};


/**
 * Function to update order status in DB
 * Arguments: 
 *      1. order_id
 *      2. new status
 *      3. rejected_reason 
 * 
 * Returns Promise:
 *      1. no return when resolve()
 *      2. {error, daoErrMessage: string} on reject()
 *          error property is an err object from DB
 */
const update_order_status = (order_id, status, rejected_reason ) => {
    return new Promise((resolve, reject) => {

        let update_status_string = `
            UPDATE orders
            SET status = $1,
            rejected_reason = $2
            WHERE id = $3;
        `;

        pool.query(update_status_string, [status, rejected_reason, order_id])
            .then(() => resolve())
            .catch(error => reject({error, daoErrMessage: "Fails update_status_string at update_order_status orderDAO.js"}));

    });
};


/**
 * Function to retrieve order_status from DB
 * Arguments: 
 *      1. order_id of order to retrieve
 * 
 * Return Promise:
 *      1. status:string on resolve()
 *      2. {error, daoErrMessage: string} on reject()
 *          error property is an err object from DB
 */
const retrieve_order_status = (order_id) => {
    return new Promise((resolve, reject) => {
        let retrieve_status_string = `
            SELECT status
            FROM ORDERS
            WHERE id = $1
        `;

        pool.query(retrieve_status_string, [order_id])
            .then(result => {
                if(result.rows.length < 1){
                    reject({daoErrMessage: "No status found"});
                }

                resolve(result.rows[0].status);

            })
            .catch(error => reject({error, daoErrMessage: "Fails update_status_string at update_order_status orderDAO.js"}));
    });
};



/*

    Private functions

*/


const insert_menu_items = (orders, order_id) => {

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


const retrieve_order_items_by_id = (order_id) => {

    return new Promise((resolve, reject) => {

        let retrieve_order_item_string = `
            select m.name as menu_name, m.price, oi.quantity
            from order_items oi
            join menu m
            on (oi.menu_id = m.id)
            where oi.order_id = $1
        `;



        pool.query(retrieve_order_item_string, [order_id])
            .then(result => {

                if(result.rows.length < 1){


                    return reject({daoErrMessage: "No order items found with this order id"});
                }


                resolve({orders: result.rows});
            })
            .catch(error => {
                reject({error, daoErrMessage: "Fails retrieve_order_item_string at retrieve_order_items_by_id orderDAO.js"});
            });


    });
};


const retrieve_order_items_by_multiple_id = (order_ids) => {

    return new Promise((resolve, reject) => {

        let retrieve_order_item_string = `
            select oi.order_id, m.name as menu_name, oi.quantity
            from order_items oi
            join menu m
            on (oi.menu_id = m.id)
            where `;

        for(let i=0; i<order_ids.length; i++){
            retrieve_order_item_string += `oi.order_id = ${order_ids[i]} OR `;
        }

        retrieve_order_item_string = retrieve_order_item_string.slice(0, -3);


        pool.query(retrieve_order_item_string)
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No order items found with these order ids"});
                }

                // Return all menu order by given array of ids.
                resolve(result.rows);
            })
            .catch(error => {
                reject({error, daoErrMessage: "Fails retrieve_order_item_string at retrieve_order_items_by_multiple_id orderDAO.js"});
            });


    });
};


const insert_order_feedback = (order_id, is_positive, comments, input_by_firstname) => {
    return new Promise((resolve, reject) => {

        let insert_feedback_string = `
            INSERT INTO feedback (is_positive, comments, input_by_firstname)
            VALUES($1, $2, $3)
            RETURNING ID;
        `;


        pool.query(insert_feedback_string, [is_positive, JSON.stringify(comments), input_by_firstname])
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No feedback id returned"});
                }


                resolve(result.rows[0].id);
            })
            .catch(error => {
                reject({error, daoErrMessage: "Fails insert_feedback_string at insert_order_feedback orderDAO.js"});
            });

    });
};


const insert_feedback_id_to_order = (feedback_id, order_id) => {

    return new Promise((resolve, reject) => {

        let insert_feedback_id_string = `
            UPDATE orders
            SET feedback_id = $1
            WHERE id = $2;
        `;

        pool.query(insert_feedback_id_string, [feedback_id, order_id])
            .then(() => resolve())
            .catch(error => {
                reject({error, daoErrMessage: "Fails insert_feedback_id_string at insert_feedback_id_to_order orderDAO.js"});
            });
    });


};

const retrieve_feedback_id = (order_id) => {
    return new Promise ((resolve, reject) => {

        let retrieve_feedback_id_string = `
            SELECT feedback_id
            FROM orders
            WHERE id = $1
        `;



        pool.query(retrieve_feedback_id_string, [order_id])
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No feedback found"});
                }

                resolve(result.rows[0].feedback_id);
            })
            .catch(error => {
                reject({error, daoErrMessage: "Fails retrieve_feedback_id_string at retrieve_feedback_id orderDAO.js"});
        });

    });
};

const retrieve_feedback = (feedback_id) => {
    return new Promise ((resolve, reject) => {

        let retrieve_feedback_string = `
            SELECT is_positive, comments, input_by_firstname
            FROM feedback
            WHERE id = $1
        `;


        pool.query(retrieve_feedback_string, [feedback_id])
            .then(result => resolve(result.rows[0]))
            .catch(error => {
                reject({error, daoErrMessage: "Fails retrieve_feedback_string at retrieve_feedback orderDAO.js"});
        });

    });

};


const retrieve_monthly_feedback = (offset) => {
    return new Promise ((resolve, reject) => {

        var last_month = moment().subtract(30, 'days').format('YYYY-MM-DD');
        var today = moment().add(1, 'days').format('YYYY-MM-DD');


        let retrieve_monthly_feedback_string = `
            SELECT o.id as order_id, o.due_datetime::text, f.is_positive, f.comments, f.input_by_firstname, k.name as kitchen_name
            FROM orders o
            JOIN feedback f
            ON (o.feedback_id = f.id)
            JOIN kitchen k
            ON (k.id = o.kitchen_id)
            WHERE due_datetime >= '${last_month}'::date
            AND due_datetime < '${today}'::date
            AND feedback_id IS NOT NULL
            OFFSET ${offset}
            LIMIT 10
        `;



        pool.query(retrieve_monthly_feedback_string)
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No feedback found"});
                }

                resolve(result.rows);
            })
            .catch(error => {
                reject({error, daoErrMessage: "Fails retrieve_monthly_feedback_string at retrieve_monthly_feedback orderDAO.js"});
        });

    });

};



const retrieve_monthly_feedback_kt = (offset, kitchen_id) => {
    return new Promise ((resolve, reject) => {

        var last_month = moment().subtract(30, 'days').format('YYYY-MM-DD');
        var today = moment().add(1, 'days').format('YYYY-MM-DD');


        let retrieve_monthly_feedback_string = `
            SELECT o.id as order_id, o.due_datetime::text, f.is_positive, f.comments, f.input_by_firstname, k.name as kitchen_name
            FROM orders o
            JOIN feedback f
            ON (o.feedback_id = f.id)
            JOIN kitchen k
            ON (k.id = o.kitchen_id)
            WHERE due_datetime >= '${last_month}'::date
            AND due_datetime < '${today}'::date
            AND feedback_id IS NOT NULL
            AND o.kitchen_id = ${kitchen_id}
            OFFSET ${offset}
            LIMIT 10
        `;



        pool.query(retrieve_monthly_feedback_string)
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No feedback found"});
                }

                resolve(result.rows);
            })
            .catch(error => {
                reject({error, daoErrMessage: "Fails retrieve_monthly_feedback_string at retrieve_monthly_feedback_kt orderDAO.js"});
            });

    });
};



const retrieve_monthly_feedback_is_positive = () => {

    return new Promise((resolve, reject) => {

        var last_month = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm');
        var today = moment().add(1, 'days').format('YYYY-MM-DD');

        let retrieve_monthly_feedback_is_positive_string = `
            SELECT f.is_positive
            FROM feedback f
            JOIN orders o
            ON (f.id = o.feedback_id)
            WHERE due_datetime >= '${last_month}'::date
            AND due_datetime < '${today}'::date;
        `;

        pool.query(retrieve_monthly_feedback_is_positive_string)
            .then(result => {

                if(result.rows.length < 1){
                    return resolve([]);
                }

                resolve(result.rows);
            })
            .catch(error => {
                reject({error, daoErrMessage: "Fails retrieve_monthly_feedback_is_positive_string at retrieve_monthly_feedback_is_positive orderDAO.js"});
        });


    });


};


const retrieve_feedback_by_order = (order_id) => {

    let select_string = `
         SELECT f.is_positive, f.comments, f.input_by_firstname
         FROM feedback f
         JOIN orders o
         ON (f.id = o.feedback_id)
         WHERE o.id = $1
    `;

    return new Promise((resolve, reject) => {

        pool.query(select_string, [order_id])
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No feedback found"});
                }

                resolve(result.rows);
            })
            .catch(error => {
                reject({error, daoErrMessage: "Fails select_string at retrieve_feedback_by_order orderDAO.js"});
        });

    });



};


/**
 * Function to retrieve ongoing orders, whichdue date is greater than current moment.
 * Ongoing orders means status != PENDING ACCEPTANCE status != PICKED UP
 * Argument: none
 * Returns a promise:
 *      1. [{due_datetime, push_token, order_id, kitchen_name}] on resolve()
 *      2. {errpr, daoErrMessage} on reject();
 */
const retrieve_ongoing_orders = () => {

    let select_string = `
        SELECT o.due_datetime::text, u.push_token, o.id as order_id, k.name as kitchen_name
        FROM users u
        JOIN kitchen k
        ON (u.kitchen_id = k.id)
        JOIN orders o
        ON (o.kitchen_id = k.id)
        WHERE o.status <> 'PENDING ACCEPTANCE' AND o.status <> 'PICKED UP'
        AND o.due_datetime > now()
        AND u.kitchen_id = o.kitchen_id
    `

    return new Promise((resolve, reject) => {

        pool.query(select_string)
            .then(result => {

                if(result.rows.length < 1){
                    return reject({daoErrMessage: "No order found"});
                }

                resolve(result.rows);
            })
            .catch(error => {
                reject({error, daoErrMessage: "Fails select_string at retrieve_feedback_by_order orderDAO.js"});
        });

    });

}


module.exports = {
    insert_order,
    retrieve_order_by_id,
    retrieve_order_by_offset,
    retrieve_order_items_by_multiple_id,
    update_order_status,
    retrieve_order_status,
    insert_order_feedback,
    insert_feedback_id_to_order,
    retrieve_feedback_id,
    retrieve_feedback,
    retrieve_monthly_feedback,
    retrieve_monthly_feedback_kt,
    retrieve_monthly_feedback_is_positive,
    retrieve_new_kitchen_order,
    retrieve_ongoing_orders
};
