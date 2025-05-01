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

    // --- Step 1: Try to find relevant product context in DB using Atlas Search ---
    try {
        const db = getDb();
        const collection = db.collection(ITEMS_COLLECTION);

        console.log(`Chat: Attempting Atlas Search for context based on: "${message}"`);
        // Use Atlas Search to find the most relevant product mentioned
        const searchResults = await collection.aggregate([
          {
            $search: {
              index: "default", // Ensure your Atlas Search index is named "default"
              // Use 'text' operator for broader matching based on keywords in the message
              text: {
                query: message, // Search using the user's full message
                // Search across relevant fields (ensure these are indexed in Atlas Search)
                path: ["Title", "Body", "Tags", "Variant SKU"], // Search multiple fields
                // Optional: Add fuzzy matching if desired
                fuzzy: { maxEdits: 1, prefixLength: 2 }
              }
            }
          },
          { $limit: 1 } // Get only the single most relevant product match
        ]).toArray();

        if (searchResults && searchResults.length > 0) {
            const potentialProduct = searchResults[0]; // Take the top result
            console.log(`Found potential product context via Atlas Search: ${potentialProduct.Title || potentialProduct['Variant SKU']}`);
            productFound = potentialProduct;
            // Construct context string for the AI
            productContext = `
Product Information:
Title: ${potentialProduct.Title || 'N/A'}
SKU: ${potentialProduct['Variant SKU'] || 'N/A'}
Description: ${potentialProduct.Body || 'No description available.'}
Price: $${parsePrice(potentialProduct['Variant Price']).toFixed(2)}
Type: ${potentialProduct.Type || 'N/A'}
Tags: ${potentialProduct.Tags || 'N/A'}
            `.trim();
        } else {
            console.log("No relevant product context found via Atlas Search for this query.");
        }

    } catch (dbError) {
        // Check if the error is because the $search stage is unknown (index might not exist)
        if (dbError.message && dbError.message.includes("Unrecognized pipeline stage name: '$search'")) {
             console.warn("Atlas Search index 'default' might be missing or not ready. Proceeding without context.");
        } else {
            console.error("Database lookup error during chat query:", dbError);
        }
        // Don't stop the process, just proceed without context
        productContext = null;
        productFound = null;
    }
    // --- End of Step 1 ---


    // --- Step 2: Prepare messages for OpenRouter AI ---
    const messagesForAI = [];

    // Add a system prompt to guide the AI
    messagesForAI.push({
        "role": "system",
        "content": productContext
            ? "You are a helpful assistant for an e-commerce store. Answer the user's question based *only* on the provided 'Product Information' context. Be concise. If the context doesn't contain the answer, say you don't have that specific information."
            : "You are a helpful assistant. Answer the user's question generally." // General prompt if no context
    });

    // Add the actual user message
    messagesForAI.push({
        "role": "user",
        "content": message
    });

    // --- Step 3: Call OpenRouter API ---
    try {
        const requestBody = {
            model: AI_MODEL,
            messages: messagesForAI,
            // Optional parameters
            // temperature: 0.7,
            // max_tokens: 150,
        };

        console.log("Sending to OpenRouter:", JSON.stringify(requestBody, null, 2));

        const apiResponse = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": YOUR_SITE_URL, // Optional
                "X-Title": YOUR_SITE_NAME,    // Optional
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        // Handle API response errors
        if (!apiResponse.ok) {
            let errorDetails = `API request failed with status ${apiResponse.status}`;
            try {
                const errorData = await apiResponse.json();
                errorDetails += `: ${JSON.stringify(errorData)}`;
            } catch (_) { /* Ignore */ }
            console.error("OpenRouter API Error:", errorDetails);
            throw new Error(`OpenRouter API request failed: ${apiResponse.statusText}`);
        }

        const responseData = await apiResponse.json();

        // Extract the assistant's reply
        const assistantMessage = responseData.choices?.[0]?.message?.content;

        if (!assistantMessage) {
            console.error("Could not extract assistant message from OpenRouter response:", responseData);
            throw new Error("Received an unexpected response format from the AI.");
        }

        console.log(`OpenRouter Response: "${assistantMessage}"`);

        // --- Step 4: Send response back to frontend ---
        // Send only the text response.
        res.json({ response: assistantMessage.trim() });

    } catch (err) {
        console.error("Chat API processing error:", err);
        res.status(500).json({ response: `Sorry, an error occurred. ${err.message}` });
    }
});

module.exports = router;
