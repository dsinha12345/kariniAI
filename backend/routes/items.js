// routes/items.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db'); // Import getDb
const { ObjectId } = require('mongodb'); // Needed for querying by _id if necessary

const ITEMS_COLLECTION = 'items'; // Define collection name

// @route   GET /api/items
// @desc    Get all items
router.get('/', async (req, res) => {
  try {
    const db = getDb(); // Get DB connection
    const items = await db.collection(ITEMS_COLLECTION).find({}).toArray(); // Use collection().find()
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ msg: 'Search query is required' });
  }
  try {
    const db = getDb();
    const items = await db.collection(ITEMS_COLLECTION).aggregate([
      {
        $search: {
          index: "default", // Ensure you have an Atlas Search index named 'default'
          text: {
            query: query,
            path: { wildcard: "*" } // Search all fields
          }
        }
      }
    ]).toArray();
    res.json(items); // Return the search results
  } catch (err) {
    console.error("Search error:", err.message); // Log any errors
    res.status(500).send('Server Error');
  }
});

module.exports = router;