// backend/scripts/cleanData.js
const path = require('path');
const { connectDB, getDb, closeDB } = require('../config/db'); // Adjust path as needed
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load .env from backend dir

const ITEMS_COLLECTION = 'items'; // Your collection name

const cleanData = async () => {
  console.log('Attempting to connect to DB for cleaning...');
  try {
    await connectDB(); // Establish connection
    const db = getDb();
    const collection = db.collection(ITEMS_COLLECTION);
    console.log(`Connected to DB. Targeting collection: '${ITEMS_COLLECTION}'`);

    // Define the filter criteria for deletion
    // Delete documents where 'Title' is null, missing, or "" OR 'Variant SKU' is null, missing, or ""
    const filter = {
      $or: [
        { Title: { $in: [null, ""] } }, // Matches if Title is null or empty string
        { Title: { $exists: false } },   // Matches if Title field doesn't exist
        { "Variant SKU": { $in: [null, ""] } }, // Matches if Variant SKU is null or empty string
        { "Variant SKU": { $exists: false } }    // Matches if Variant SKU field doesn't exist
      ]
    };

    console.log('Finding documents to delete based on filter...');
    const countToDelete = await collection.countDocuments(filter);

    if (countToDelete > 0) {
        console.log(`Found ${countToDelete} documents with missing/empty Title or Variant SKU. Deleting...`);
        const deleteResult = await collection.deleteMany(filter);
        console.log(`Successfully deleted ${deleteResult.deletedCount} documents.`);
    } else {
        console.log('No documents found matching the deletion criteria.');
    }

  } catch (error) {
    console.error('Error during data cleaning:', error);
  } finally {
    console.log("Closing DB connection after cleaning attempt...");
    await closeDB(); // Ensure connection is closed
    console.log("Cleaning script finished.");
  }
};

// Run the cleaning function
cleanData();
