// server.js
const express = require('express');
const { connectDB, closeDB } = require('./config/db'); // Import connectDB and closeDB
const cors = require('cors');
require('dotenv').config();

const app = express();

// Init Middleware
app.use(cors()); // Allow requests from your frontend domain
app.use(express.json({ extended: false })); // To accept JSON body data

// Define Routes
app.get('/', (req, res) => res.send('API Running')); // Simple test route
app.use('/api/items', require('./routes/items'));
// Add chat routes later if needed:
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5001; // Use environment port or default

// Function to start the server (used for actual deployment/running)
const startServer = async () => {
  try {
    await connectDB(); // Ensure DB is connected before starting
    const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

    // Graceful Shutdown (optional but good practice)
    const shutdown = async (signal) => {
        console.log(`${signal} signal received: closing MongoDB connection and shutting down server.`);
        await closeDB();
        server.close(() => {
            console.log('Server shut down.');
            process.exit(0);
        });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (err) {
    console.error("Failed to connect to DB or start server.", err);
    process.exit(1); // Exit if DB connection fails initially
  }
};

// Start the server only if this file is run directly (not required/imported)
if (require.main === module) {
  startServer();
}

// Export the app and DB functions for testing
module.exports = { app, connectDB, closeDB };
