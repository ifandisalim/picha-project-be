require('dotenv').config();


// External NPM Modules
const express       = require('express');
const bodyParser    = require('body-parser');
const http          = require('http');
const socketIO      = require('socket.io');


const port = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);
const io = socketIO(server);



app.use(bodyParser.json());

// Custom middlewares
const authenticate = require('./middlewares/authenticate');


app.post('/user/register/operation_team', require('./routes/signup_operation_team'));
app.post('/user/register/kitchen_team', require('./routes/signup_kitchen_team'));
app.post('/user/login', require('./routes/login'));

app.get('/kitchen', authenticate, require('./routes/get_kitchen_list'));
app.get('/kitchen/menu/:kitchen_id', authenticate, require('./routes/get_kitchen_menu'));


app.get('/test/insert', require('./playground/test_insert'));


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
