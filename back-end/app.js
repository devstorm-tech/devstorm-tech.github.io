require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

// Defensive boot-time logging for uncaught errors
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION (server boot):', err && err.stack ? err.stack : err);
  // In production you might want to exit process or alert a monitoring service
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION (server boot):', reason && reason.stack ? reason.stack : reason);
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// CORS – allow frontend with credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/', apiRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;