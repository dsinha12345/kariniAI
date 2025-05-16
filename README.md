# E-commerce Demo Application

This project demonstrates a full-stack e-commerce application featuring a product catalog, search functionality, and an AI-powered chat assistant integrated with product context.

## Functionality

### Backend (`/backend`)

*   **API Server:** Built with Node.js and Express.js, providing RESTful endpoints for product data and chat interactions.
*   **Database:** Uses MongoDB to store product information (items). Leverages the native MongoDB driver and includes configuration for database connection (`config/db.js`). Scripts for data import (`scripts/importData.js`) and cleaning (`scripts/cleanData.js`) are available.
*   **Product Catalog API (`routes/items.js`):**
    *   `GET /api/items`: Retrieves all products from the database.
    *   `GET /api/items/search`: Performs text-based search across product details using MongoDB Atlas Search, taking a query parameter `q`.
*   **AI Chat Assistant API (`routes/chat.js`):**
    *   `POST /api/chat/query`: Accepts user messages. It attempts to find relevant product context by first checking for SKUs in the message and querying the database directly, then falling back to MongoDB Atlas Search if no SKU is found. It constructs a system prompt including any found product context (or a default prompt if none is found) and interacts with the OpenRouter AI service (`fetch` API) to generate context-aware responses. The AI prompt is tuned for professional customer support interactions.
*   **Testing (`__tests__/`):** Includes API integration tests written with Jest and Supertest to ensure endpoint reliability and correctness. Tests cover both item and chat routes, with mocking for external API calls.

### Frontend (`/frontend`)

*   **Web Interface:** A Next.js (React) application providing the user interface for browsing and interacting with the store. Built with TypeScript.
*   **Product Display:** Fetches and displays products from the backend API using components like `ItemList.tsx` and `Item.tsx`.
*   **Search:** Allows users to search for products via a search bar (`SearchBar.tsx` component), interacting with the backend search API.
*   **Shopping Cart:** Includes basic cart functionality components (`Cart.tsx`, `CartItem.tsx`).
*   **Chat Interface:** Provides a UI (`ChatInterface.tsx` component) for users to interact with the AI assistant, sending messages to the backend chat API and displaying responses.
*   **Styling:** Uses Tailwind CSS for utility-first styling and layout, configured via `tailwind.config.ts` and `postcss.config.mjs`.

## Technologies Used

### Backend

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (using native `mongodb` driver)
*   **API Testing:** Jest, Supertest
*   **Environment Variables:** `dotenv`
*   **CORS:** `cors` package
*   **AI Service Integration:** OpenRouter (via standard `fetch` API)
*   **Development Utility:** `nodemon`

### Frontend

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **UI Library:** React
*   **Styling:** Tailwind CSS, PostCSS
*   **Package Manager:** npm (implied by `package.json`, `package-lock.json`)

### General

*   **Version Control:** Git (implied by `.gitignore`)
*   **Data Format:** JSON (for `data.json` and API communication)
