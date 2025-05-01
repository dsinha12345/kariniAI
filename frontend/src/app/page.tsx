// src/app/page.tsx (or .jsx / .js)

"use client"; // Directive to mark this as a Client Component

import React, { useState, useEffect } from 'react';
// Import required components
import ItemList from '@/components/ItemList'; // Make sure the path is correct
import SearchBar from '@/components/SearchBar'; // Import SearchBar
import Cart from '@/components/Cart'; // Import the Cart component
import ChatInterface from '@/components/ChatInterface'; // Import ChatInterface

// Define the structure of an item based on your data.json and backend response
interface Item {
  _id?: string;
  Handle: string;
  Title: string;
  'Variant SKU': string;
  'Variant Price': number | string; // Allow string initially from data
  'Image Src': string;
  [key: string]: any;
}

// Define the structure for cart items (includes quantity)
interface CartItem extends Item {
  quantity: number;
}

// Define the API URL, falling back to localhost if env var isn't set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Helper function to safely parse price string/number to number
const parsePrice = (priceValue: number | string | undefined | null): number => {
    const num = parseFloat(String(priceValue)); // Convert to string first to handle potential numbers
    return !isNaN(num) ? num : 0; // Return 0 if parsing results in NaN
}

export default function Home() {
  // State for the list of items displayed
  const [items, setItems] = useState<Item[]>([]);
  // State to track if data is currently being loaded
  const [loading, setLoading] = useState<boolean>(true);
  // State to store any errors encountered during data fetching
  const [error, setError] = useState<string | null>(null);
  // State to hold the items currently in the shopping cart
  const [cart, setCart] = useState<CartItem[]>([]);
  // State to track if the current item list is a result of a search
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Function to fetch all items from the backend
  const fetchAllItems = async () => {
      setLoading(true); // Set loading state
      setError(null);   // Clear previous errors
      setIsSearching(false); // Reset searching state
      try {
        // Fetch items from the /api/items endpoint
        const response = await fetch(`${API_URL}/items`);
        if (!response.ok) { // Check for HTTP errors
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Item[] = await response.json(); // Parse the JSON response
        setItems(data); // Update the items state
      } catch (e) {
        // Handle any errors during the fetch process
        console.error("Failed to fetch items:", e);
        const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(`Failed to load items: ${errorMsg}`);
        setItems([]); // Clear items on error
      } finally {
        setLoading(false); // Set loading to false once done
      }
    };

  // useEffect hook to fetch all items when the component initially mounts
  useEffect(() => {
    fetchAllItems();
  }, []); // Empty dependency array means it runs only once

  // --- Search Handler ---
  // Function to handle search requests triggered by the SearchBar component
  const handleSearch = async (query: string) => {
    // If the search query is empty, fetch all items instead
    if (!query.trim()) {
      fetchAllItems();
      return;
    }

    console.log("Searching for:", query);
    setLoading(true); // Set loading state
    setError(null);   // Clear previous errors
    setIsSearching(true); // Set searching state
    try {
      // Fetch search results from the /api/items/search endpoint
      const response = await fetch(`${API_URL}/items/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) { // Check for HTTP errors
        throw new Error(`Search failed! status: ${response.status}`);
      }
      const searchResults: Item[] = await response.json(); // Parse results
      setItems(searchResults); // Update items state with search results
    } catch (e) {
      // Handle search errors
      console.error("Search failed:", e);
      const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Search failed: ${errorMsg}`);
      setItems([]); // Clear items on error
    } finally {
      setLoading(false); // Set loading to false
    }
  };
  // --- End Search Handler ---

  // --- Cart Handlers ---
  // Function to add an item to the cart or increment its quantity
  const addToCart = (itemToAdd: Item) => {
    console.log("Adding to cart:", itemToAdd.Title || itemToAdd['Variant SKU']);
    setCart(prevCart => {
      // Check if the item already exists in the cart by SKU
      const existingItemIndex = prevCart.findIndex(
        item => item['Variant SKU'] === itemToAdd['Variant SKU']
      );

      if (existingItemIndex > -1) {
        // If item exists, create a new cart array with updated quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        console.log(`Increased quantity for ${itemToAdd['Variant SKU']}`);
        return updatedCart;
      } else {
        // If item is new, add it to the cart with quantity 1
        console.log(`Adding new item ${itemToAdd['Variant SKU']}`);
        // Ensure the price is stored as a number
        const numericPriceItem = {
            ...itemToAdd,
            'Variant Price': parsePrice(itemToAdd['Variant Price'])
        };
        return [...prevCart, { ...numericPriceItem, quantity: 1 }];
      }
    });
  };

  // Function to remove an item completely from the cart by SKU
  const removeFromCart = (skuToRemove: string) => {
    console.log("Removing from cart SKU:", skuToRemove);
    setCart(prevCart => {
      // Create a new cart array excluding the item with the matching SKU
      return prevCart.filter(item => item['Variant SKU'] !== skuToRemove);
    });
  };
  // --- End Cart Handlers ---

  return (
    // Main container with relative positioning for the fixed chat button
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
      {/* Sticky Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center">Single-Page Ordering</h1>
      </header>

      {/* Main content area with grid layout and padding-bottom */}
      <main className="container mx-auto p-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">

        {/* Product Listing and Search Area */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          {/* Render the SearchBar */}
          <SearchBar onSearch={handleSearch} />

          {/* Conditional rendering for loading state */}
          {loading && <p className="text-center text-gray-500 dark:text-gray-400 py-10">Loading...</p>}

          {/* Conditional rendering for error state */}
          {error && <p className="text-center text-red-500 py-10">Error: {error}</p>}

          {/* Render the ItemList if not loading and no error */}
          {!loading && !error && (
            <ItemList items={items} onAddToCart={addToCart} />
          )}
          {/* Display message if search yields no results */}
          {!loading && !error && isSearching && items.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">No items found matching your search.</p>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="md:col-span-1 space-y-6">
           {/* Render the Cart component, passing state and remove function */}
           <Cart cartItems={cart} onRemoveFromCart={removeFromCart} />
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center p-4 mt-8 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        My Ordering App &copy; {new Date().getFullYear()}
      </footer>

      {/* Render ChatInterface outside the main grid, passing the API URL */}
      {/* This component handles its own fixed positioning */}
      <ChatInterface apiUrl={API_URL} />

    </div>
  );
}
