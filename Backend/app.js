const express = require('express');
const connectmongodb = require("./ConnectDb");
const http = require("http");
const { Server } = require("socket.io");

connectmongodb();

const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(cors({
  origin: true,
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Two Frontend Component Can talk each other
    methods: ["GET", "POST"]
  }
});

// Connection Code start 

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const login = require('./Routes/login');
const Signup = require('./Routes/signup');
app.get("/",(req,res)=> {
  res.send("Backend");
})
app.use('/login',login);
app.use('/Signup',Signup); // Signup/signup

server.listen(3000, function () {
    console.log("App is  listning on port 3000");
})


// Accounts : 
// Dinasha123@gmail.com : 12456
// Sukhdevvinay9693@gmail.com : 123456