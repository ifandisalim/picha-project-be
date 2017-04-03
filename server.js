require('dotenv').config();


// External NPM Modules
const express       = require('express');
const bodyParser    = require('body-parser');
const http          = require('http');
const path          = require('path');



const port = process.env.PORT || 3001;
const app = express();

const server = http.createServer(app);
// Import io and initialze it
const io = require('./socket').initialize(server);






const publicPath = path.join(__dirname, './public');
app.use(express.static(publicPath));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, content-type, access_token");
    next();
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
app.get('/order/history/incomplete/kt/:offset/:kitchen_id', authenticate, require('./routes/get_incomplete_history').all_kitcen_history);






//testing
app.get('/test/socket', require('./listen_socket_events/userEvents'));



server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
