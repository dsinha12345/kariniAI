// backend/scripts/importData.js
const fs = require('fs');
const path = require('path');
const { connectDB, getDb, closeDB } = require('../config/db'); // Adjust path as needed
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load .env from backend dir

const ITEMS_COLLECTION = 'items'; // Collection name

const importData = async () => {
  console.log('Attempting to connect to DB for import...');
  try {
    await connectDB(); // Establish connection first
    const db = getDb();
    console.log('DB Connected for import. Reading data file...');

    // Construct the path to data.json relative to the project root (kariniAI)
    const dataPath = path.join(__dirname, '..', '..', 'data.json'); // Assumes script is in backend/scripts and data.json is in kariniAI/
    console.log(`Looking for data file at: ${dataPath}`);

    if (!fs.existsSync(dataPath)) {
        throw new Error(`data.json not found at expected path: ${dataPath}`);
    }

    const itemsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    if (!Array.isArray(itemsData)) {
        throw new Error("data.json content is not a valid JSON array.");
    }

    console.log(`Read ${itemsData.length} items from data.json.`);

    // Optional: Clear existing data before import
    const collection = db.collection(ITEMS_COLLECTION);
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
        console.log(`Deleting ${existingCount} existing items from '${ITEMS_COLLECTION}' collection...`);
        await collection.deleteMany({});
        console.log('Existing items deleted.');
    } else {
        console.log(`Collection '${ITEMS_COLLECTION}' is empty or does not exist. No items to delete.`);
    }


    console.log(`Importing ${itemsData.length} items into '${ITEMS_COLLECTION}'...`);
    if (itemsData.length > 0) {
      const result = await collection.insertMany(itemsData);
      console.log(`${result.insertedCount} items successfully imported!`);
    } else {
      console.log('No items to import.')
    }

  } catch (error) {
    console.error('Error during data import:', error);
    // Don't exit process here, let finally block handle closing
  } finally {
    console.log("Closing DB connection after import attempt...");
    await closeDB(); // Ensure connection is closed whether success or error
    console.log("Import script finished.");
  }
};

importData(); // Run the import function