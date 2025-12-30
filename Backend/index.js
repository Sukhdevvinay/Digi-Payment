// ```javascript
const express = require('express');
const path = require('path');
// Load env vars. Check root folder if running from Backend/
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose'); // Import mongoose
const connectmongodb = require("./ConnectDb");
const http = require("http");
const { Server } = require("socket.io");

connectmongodb();

const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : "http://localhost:3001";
// Note: REACT_APP_API_URL typically points to backend, we want the frontend origin for CORS.
// Better to use a separate var or just allow all for now if simple. 
// User's .env had "Frontend_URL", let's use that if feasible, or just fallback to localhost:3001 and allow wildcard/dynamic.

app.use(cors({
  origin: true, // Allow all or reflect request origin (good for testing)
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for socket for now to avoid issues
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
app.get("/", (req, res) => {
  res.send("Backend Running");
})
app.get("/health", (req, res) => {
  res.json({
    status: 'ok',
    dbState: mongoose.connection.readyState,
    host: mongoose.connection.host
  });
})
app.use('/login', login);
app.use('/Signup', Signup); // Signup/signup
const transactionRoutes = require('./Routes/transaction');
app.use('/transaction', transactionRoutes);
const userRoutes = require('./Routes/user');
app.use('/user', userRoutes);

// Wait for DB connection before starting server
connectmongodb().then(() => {
  server.listen(PORT, function () {
    console.log(`App is listening on port ${PORT} `);
  })
}).catch(err => {
  console.error("Failed to connect to DB, server not started", err);
});


// Accounts :
// Dinasha123@gmail.com : 12456
// Sukhdevvinay9693@gmail.com : 123456
