require('dotenv').config();


// External NPM Modules
const express       = require('express');
const bodyParser    = require('body-parser');
const http          = require('http');
const path          = require('path');



const port = process.env.PORT || 3001;
const app = express();

const server = http.createServer(app);
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


app.get('/test/insert', require('./playground/test_insert'));


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
