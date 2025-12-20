import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Import the connected mongoose instance. `mongoClient.js` performs the connection
// during module evaluation and exports the mongoose instance as default.
import mongoose from './config/mongoClient.js';
import apiRoutes from './routes/apiRoutes.js';
import authroutes from './routes/authroutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. MIDDLEWARE
app.use(cors({
    origin: true, // Allow all origins dynamically
    credentials: true
}));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// 2. CONNECT DATABASES
// Connection is established when `mongoClient.js` is imported above.

// 3. ROUTES
app.use('/api/auth', authroutes); // AUTH ROUTE (Register/Login)
app.use('/api', apiRoutes);       // APP ROUTE (Chat/Crawl)

// 4. HEALTH CHECK
app.get('/', (req, res) => {
    res.send('AskGenie API is running! 🧞‍♂️');
});

// 5. START SERVER
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});