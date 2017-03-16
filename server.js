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


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
