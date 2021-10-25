const express = require('express');
var cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//Import for socket
const WebSocket = require('ws');
 const server = require("http").createServer(app);
const wss = new WebSocket.Server({
    server
});
app.use(cors())
//Import Routes
const usersRoute = require('./routes/drivers-routes');

//Import reserver_taxi function
const {
    Reserver_taxi
} = require('./Reservation/Socket');



app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// All the routes 
app.use('/', usersRoute);

// app.get('/',(req,res)=>{
//     res.send('Hello my First WS !!! ');
//     });


//Port we running the server on
const port = process.env.PORT || 3000;
//app.listen(port,()=>console.log('Listenning on port ' + port));
server.listen(port, () => {
    console.log('Server started on port' + port);
});

// the path of mongodb database
const dbPath = 'mongodb+srv://rania:rania@cluster0.oboep.mongodb.net/webservice?retryWrites=true&w=majority';
const url = 'mongodb://rania:rania@localhost:27017/webservice';

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
const mongo = mongoose.connect(dbPath, options);
mongo.then(() => {
    console.log('Successfully connected to DB');
}, error => {
    console.log(error, 'error');
});


const { Pool, Client } = require("pg");

const pool = new Pool({
  user: "reservation_user",
  host: "164.132.144.235",
  database: "taxiora",
  password: "FIaiJPH6",
  port: "5432"
})
pool.connect(function(err) {
    if (err) throw err;
    console.log("Connected to Postegresql!");
  });
//reservation's function
 Reserver_taxi(wss,pool);