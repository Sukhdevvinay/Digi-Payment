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

// CORS: Explicitly allow Vercel and Localhost (Required for credentials: true)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://sukhbank.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      console.log("Blocked by CORS:", origin);
      // For debugging, you might want to allow it temporarily or just log it.
      // Strictly blocking it is safer:
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

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
  const dbState = mongoose.connection.readyState;
  res.json({
    status: 'ok',
    dbState,
    dbStateString: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState],
    host: mongoose.connection.host
  });
})

// Middleware: Check DB connection before handling requests
app.use((req, res, next) => {
  if (mongoose.connection ? mongoose.connection.readyState !== 1 : true) {
    if (req.path === '/health') return next(); // Allow health check
    return res.status(503).json({ message: "Database not connected yet", dbState: mongoose.connection ? mongoose.connection.readyState : 0 });
  }
  next();
});

app.use('/login', login);
app.use('/signup', Signup); // Lowercase /signup to ensure matching
const transactionRoutes = require('./Routes/transaction');
app.use('/transaction', transactionRoutes);
const userRoutes = require('./Routes/user');
app.use('/user', userRoutes);

// 404 Handler (Must be last)
app.use((req, res, next) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).send("Route not found");
});

// Start Server IMMEDIATELY (Do not wait for DB)
server.listen(PORT, function () {
  console.log(`App is listening on port ${PORT}`);
});

// Connect DB in background
connectmongodb().catch(err => {
  console.error("Failed to connect to DB:", err);
});


// Accounts :
// Dinasha123@gmail.com : 12456
// Sukhdevvinay9693@gmail.com : 123456
