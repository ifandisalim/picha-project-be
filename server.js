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

// Custom middlewares
const authenticate = require('./middlewares/authenticate');


app.post('/user/register/operation_team', require('./routes/signup_operation_team'));
app.post('/user/register/kitchen_team', require('./routes/signup_kitchen_team'));
app.post('/user/login', require('./routes/login'));

app.get('/kitchen', authenticate, require('./routes/get_kitchen_list'));
app.get('/kitchen/menu/:kitchen_id', authenticate, require('./routes/get_kitchen_menu'));
app.get('/order_preferences', authenticate, require('./routes/get_order_preferences'));
app.post('/order', authenticate, require('./routes/new_order'));
app.get('/order/:order_id', authenticate, require('./routes/get_order_by_id'));
app.get('/order/history/completed/ot/:offset', authenticate, require('./routes/get_completed_history').all_kitcen_history);
app.get('/order/history/incomplete/ot/:offset', authenticate, require('./routes/get_incomplete_history').all_kitcen_history);
app.get('/order/history/completed/kt/:offset/:kitchen_id', authenticate, require('./routes/get_completed_history').kitchen_history);
app.get('/order/history/incomplete/kt/:offset/:kitchen_id', authenticate, require('./routes/get_incomplete_history').all_kitcen_history);

app.post('/order/response', authenticate, require('./routes/response_to_order'));




//testing
app.get('/test/socket', require('./listen_socket_events/userEvents'));



server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
