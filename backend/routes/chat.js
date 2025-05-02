// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db'); // Import getDb to access the database
require('dotenv').config();

// --- OpenRouter API Configuration ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const YOUR_SITE_URL = process.env.YOUR_SITE_URL || 'http://localhost:3000';
const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || 'Karini Demo';
const AI_MODEL = "qwen/qwen3-0.6b-04-28:free"; // Or your preferred model

// --- Database Configuration ---
const ITEMS_COLLECTION = 'items';

// Helper to check for API key
if (!OPENROUTER_API_KEY) {
    console.error("FATAL ERROR: OPENROUTER_API_KEY environment variable is not set.");
}

// Helper function to safely parse price
const parsePrice = (priceValue) => {
    const num = parseFloat(String(priceValue));
    return !isNaN(num) ? num : 0;
}

// --- Main Chat Query Route ---
router.post('/query', async (req, res) => {
    const { message } = req.body;

    // --- Input Validation ---
    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ response: 'Message is required and must be a non-empty string.' });
    }
    if (!OPENROUTER_API_KEY) {
         console.error("OpenRouter API Key not configured on the server.");
         return res.status(500).json({ response: 'Chat service is not configured correctly.' });
    }

    console.log(`Received chat query: "${message}"`);

    let productContext = null;
    let productFound = null;
    let potentialProduct = null; // Declare potentialProduct outside the try block

    // --- Step 1: Try to find relevant product context in DB ---
    try {
        const db = getDb();
        const collection = db.collection(ITEMS_COLLECTION);

        // --- Improvement: Check for SKU pattern first ---
        // Regex to find potential SKUs (adjust if your SKU format differs)
        // This looks for patterns like DBxxx-xxx-x or TSxx-xxx-x etc.
        const skuRegex = /([A-Z]{2}\d+-[A-Z]{3}-\d+)/i; // Case-insensitive
        const skuMatch = message.match(skuRegex);

        if (skuMatch && skuMatch[1]) {
            const skuToFind = skuMatch[1];
            console.log(`Chat: Extracted potential SKU: ${skuToFind}. Attempting findOne.`);
            // Use findOne for exact SKU match - more reliable than text search for SKUs
            potentialProduct = await collection.findOne({ "Variant SKU": skuToFind });
            if (potentialProduct) {
                 console.log(`Found product context via SKU findOne: ${potentialProduct.Title || potentialProduct['Variant SKU']}`);
            } else {
                 console.log(`No product found with exact SKU: ${skuToFind}. Falling back to Atlas Search.`);
            }
        }
        // --- End SKU Check ---

        // --- Fallback to Atlas Search if no exact SKU match found ---
        if (!potentialProduct) {
            console.log(`Chat: Attempting Atlas Search for context based on: "${message}"`);
            const searchResults = await collection.aggregate([
              {
                $search: {
                  index: "default",
                  text: {
                    query: message,
                    path: ["Title", "Body", "Tags", "Variant SKU"],
                    fuzzy: { maxEdits: 1, prefixLength: 2 }
                  }
                }
              },
              { $limit: 1 }
            ]).toArray();

            if (searchResults && searchResults.length > 0) {
                potentialProduct = searchResults[0]; // Take the top result
                console.log(`Found potential product context via Atlas Search: ${potentialProduct.Title || potentialProduct['Variant SKU']}`);
            } else {
                console.log("No relevant product context found via Atlas Search for this query.");
            }
        }
        // --- End Atlas Search Fallback ---

        // --- Construct Context if a product was found by either method ---
        if (potentialProduct) {
            productFound = potentialProduct;
            productContext = `
Product Information:
Title: ${potentialProduct.Title || 'N/A'}
SKU: ${potentialProduct['Variant SKU'] || 'N/A'}
Description: ${potentialProduct.Body || 'No description available.'}
Price: $${parsePrice(potentialProduct['Variant Price']).toFixed(2)}
Type: ${potentialProduct.Type || 'N/A'}
Tags: ${potentialProduct.Tags || 'N/A'}
            `.trim();
        }
        // --- End Context Construction ---

    } catch (dbError) {
        if (dbError.message && dbError.message.includes("Unrecognized pipeline stage name: '$search'")) {
             console.warn("Atlas Search index 'default' might be missing or not ready. Proceeding without context.");
        } else {
            console.error("Database lookup error during chat query:", dbError);
        }
        productContext = null;
        productFound = null;
    }
    // --- End of Step 1 ---


    // --- Step 2: Prepare messages for OpenRouter AI ---
    const messagesForAI = [];
    messagesForAI.push({
        "role": "system",
        "content": productContext
            ? `You are a professional customer support specialist for ${YOUR_SITE_NAME}. Your goal is to assist users by providing accurate information based *strictly* on the product details provided below. Maintain a polite and helpful tone.\n\n- Answer the user's query using *only* the 'Product Information' provided.\n- Do not invent details or use external knowledge.\n- If the provided information does not contain the answer, clearly state that the specific detail is not available in the product information you have access to. You may offer to answer general questions about the store if appropriate.\n- Keep your responses clear and concise.\n\nProduct Information:\n${productContext}`
            : `You are a professional customer support specialist for ${YOUR_SITE_NAME}. Your goal is to assist users politely and helpfully. Answer the user's general questions about our store or products. If you cannot answer a specific question, please say so clearly. Keep your responses clear and concise.`
    });

    messagesForAI.push({
        "role": "user",
        "content": message
    });

    // --- Step 3: Call OpenRouter API ---
    try {
        const requestBody = {
            model: AI_MODEL,
            messages: messagesForAI,
        };
        console.log("Sending to OpenRouter:", JSON.stringify(requestBody, null, 2));
        const apiResponse = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!apiResponse.ok) {
            let errorDetails = `API request failed with status ${apiResponse.status}`;
            try { const errorData = await apiResponse.json(); errorDetails += `: ${JSON.stringify(errorData)}`; } catch (_) { /* Ignore */ }
            console.error("OpenRouter API Error:", errorDetails);
            throw new Error(`OpenRouter API request failed: ${apiResponse.statusText}`);
        }
        const responseData = await apiResponse.json();
        const assistantMessage = responseData.choices?.[0]?.message?.content;

        if (!assistantMessage) {
            console.error("Could not extract assistant message from OpenRouter response:", responseData);
            throw new Error("Received an unexpected response format from the AI.");
        }

        // --- Step 4: Send response back to frontend ---
        res.json({ response: assistantMessage.trim() });

    } catch (err) {
        console.error("Chat API processing error:", err);
        res.status(500).json({ response: `Sorry, an error occurred. ${err.message}` });
    }
});

module.exports = router;
