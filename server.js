require('dotenv').config();


// External NPM Modules
const express       = require('express');
const bodyParser    = require('body-parser');
const http          = require('http');
const path          = require('path');
const moment        = require('moment');


const port = process.env.PORT || 3001;
const app = express();

const server = http.createServer(app);
// Import io and initialze it
const io = require('./socket').initialize(server);
const orderDAO = require('./dao/orderDAO');
const userDAO = require('./dao/userDAO');
const scheduler = require('./scheduler');





const publicPath = path.join(__dirname, './public');
app.use(express.static(publicPath));
app.use(bodyParser.json());

// Allow custom headers access_token and Content-Type
// Allow any origin (So localhost:3000 can request to localhost:3001)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, content-type, access_token");
    next();
});



/**
 * Restarting Cron jobs for reminder of orders
 */
orderDAO.retrieve_pending_orders()
.then(rows => {

    let kt_push_token_by_order = rows.reduce((currObj, row ) => {
        currObj[row.order_id] = {push_tokens: []} || currObj[row.order_id];

         currObj[row.order_id].push_tokens.push(row.push_token);
         currObj[row.order_id].due_datetime = row.due_datetime;
         currObj[row.order_id].kitchen_name = row.kitchen_name;
         return currObj;
    }, {});

    userDAO.retrieve_all_ot_push_token()
    .then(rows2 => {

        let ot_push_tokens = rows2
        .filter(row =>  row.push_token !== null)
        .map(row => row.push_token);

        // Loop through orders and reset notification schedule
        for(let order_id in kt_push_token_by_order){

            let moment_due_datetime = moment(kt_push_token_by_order[order_id].due_datetime),
                push_tokens = kt_push_token_by_order[order_id].push_tokens.concat(ot_push_tokens),
                due_datetime = moment_due_datetime.format('D MMM YYYY h:mm A'),
                kitchen_name = kt_push_token_by_order[order_id].kitchen_name;


            let schedule = scheduler.schedule_order_reminder(moment_due_datetime, () => {
                ionicPushServer(notificationCred.pushCredentials, {
                    "tokens": push_tokens,
                    "profile": "dev",
                    "notification": {
                        "title": "Reminder",
                        "message": `Reminder upcoming order for ${kitchen_name}. Due ${due_datetime}`
                    }
                });
                schedule.cancel();
            });

            let schedule_day_before = scheduler.schedule_day_before_reminder(moment_due_datetime, () => {
                ionicPushServer(notificationCred.pushCredentials, {
                    "tokens": push_tokens,
                    "profile": "dev",
                    "notification": {
                        "title": "Reminder",
                        "message": `Reminder next day order for ${kitchen_name}. Due ${formatted_due_datetime}`
                    }
                });
                schedule_day_before.cancel();
            });

        }


    })
    .catch(err => {
        console.log("Error in server.js retrieve_all_ot_push_token");
        console.log(err);
    });
})
.catch(err => {
    console.log("Error in server.js retrieve_pending_orders");
    console.log(err);
});



// Custom middlewares
const authenticate = require('./middlewares/authenticate');


app.post('/user/register/operation_team', require('./routes/signup_operation_team'));
app.post('/user/register/kitchen_team', require('./routes/signup_kitchen_team'));
app.post('/user/retrieve_id/', require('./routes/get_user_id'));
app.post('/user/reset_password/', require('./routes/reset_password'));
app.post('/user/login', require('./routes/login'));

app.post('/user/update_push_token', authenticate, require('./routes/update_push_token'));

app.get('/kitchen', authenticate, require('./routes/get_kitchen_list'));
app.get('/kitchen/menu/:kitchen_id', authenticate, require('./routes/get_kitchen_menu'));
app.get('/order_preferences', authenticate, require('./routes/get_order_preferences'));

app.post('/order', authenticate, require('./routes/new_order'));
app.post('/order/update_status', authenticate, require('./routes/update_order_status'));
app.post('/order/feedback', authenticate, require('./routes/insert_order_feedback'));
app.get('/order/feedback/:order_id', authenticate, require('./routes/retrieve_order_feedback'));
app.get('/order/feedback/monthly/:offset', authenticate, require('./routes/get_all_monthly_feedback'));


app.get('/order/:order_id', authenticate, require('./routes/get_order_by_id'));
app.get('/order/history/completed/ot/:offset', authenticate, require('./routes/get_completed_history').all_kitcen_history);
app.get('/order/history/incomplete/ot/:offset', authenticate, require('./routes/get_incomplete_history').all_kitcen_history);
app.get('/order/history/completed/kt/:offset/:kitchen_id', authenticate, require('./routes/get_completed_history').kitchen_history);
app.get('/order/history/incomplete/kt/:offset/:kitchen_id', authenticate, require('./routes/get_incomplete_history').kitchen_history);
app.get('/order/new/:kitchen_id', authenticate, require('./routes/get_new_kitchen_orders'));






//testing
app.get('/test/socket', require('./listen_socket_events/userEvents'));



server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
