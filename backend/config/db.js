// config/db.js
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // Make sure to install dotenv: npm install dotenv

// Use the MONGO_URI from your .env file
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('Error: MONGO_URI environment variable is not set.');
  process.exit(1);
}

// Create a MongoClient with options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let dbConnection;

const connectDB = async () => {
  if (dbConnection) {
    console.log("Using existing MongoDB connection.");
    return dbConnection;
  }
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB Atlas!");
    dbConnection = client.db("yourDatabaseName"); // Specify your database name here
    // Optional: You might want to ping to confirm
    await dbConnection.command({ ping: 1 });
    console.log("Pinged deployment successfully.");
    return dbConnection;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    await client.close(); // Ensure client is closed on initial connection failure
    process.exit(1);
  }
};

// Function to get the database connection instance
const getDb = () => {
  if (!dbConnection) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return dbConnection;
};

// Function to close the connection (useful for graceful shutdown)
const closeDB = async () => {
    if(client && client.topology && client.topology.isConnected()) {
        await client.close();
        console.log("MongoDB connection closed.");
        dbConnection = null;
    }
};

module.exports = { connectDB, getDb, closeDB }; // Export functions