const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
console.log('Loading environment variables...');
dotenv.config();

if (process.env.MONGODB_URI) {
  const maskedURI = process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');
  console.log(`Environment loaded. MONGODB_URI exists: ${maskedURI}`);
} else {
  console.error('Environment Error: MONGODB_URI is not defined.');
}

// Connect to database and start server
connectDB().then(() => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/expenses', require('./routes/expenseRoutes'));

  const PORT = process.env.PORT || 5000;

  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  // Error handler
  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}).catch(err => {
  console.error(`Failed to connect to database: ${err.message}`);
  process.exit(1);
});
