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

// @route   GET /api/items/search
// @desc    Search items by Title or SKU
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ msg: 'Search query is required' });
  }
  try {
    const db = getDb();
    // Ensure you have a text index created in MongoDB on Title and 'Variant SKU'
    // db.collection('items').createIndex({ Title: 'text', 'Variant SKU': 'text' })
    const items = await db.collection(ITEMS_COLLECTION).find(
        { $text: { $search: query } },
        { projection: { score: { $meta: "textScore" } } } // Project score if needed
    ).sort({ score: { $meta: "textScore" } }).toArray();

    // Alternative: Regex search (less efficient)
    /*
    const items = await db.collection(ITEMS_COLLECTION).find({
        $or: [
          { Title: { $regex: query, $options: 'i' } },
          { 'Variant SKU': { $regex: query, $options: 'i' } }
        ]
    }).toArray();
    */
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;