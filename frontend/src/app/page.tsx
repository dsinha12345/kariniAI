// src/app/page.tsx (or .jsx / .js)

"use client"; // Directive to mark this as a Client Component

import React, { useState, useEffect } from 'react';
// Import required components
import ItemList from '@/components/ItemList'; // Make sure the path is correct
import SearchBar from '@/components/SearchBar'; // Import SearchBar
// We will create and import these components in the next steps
// import Cart from '@/components/Cart';
// import ChatInterface from '@/components/ChatInterface';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Helper function to safely parse price
const parsePrice = (priceValue: number | string | undefined | null): number => {
    const num = parseFloat(String(priceValue));
    return !isNaN(num) ? num : 0; // Return 0 if NaN or invalid
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false); // Track if results are from search

  // Function to fetch all items
  const fetchAllItems = async () => {
      setLoading(true);
      setError(null);
      setIsSearching(false); // Not searching when fetching all
      try {
        const response = await fetch(`${API_URL}/items`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Item[] = await response.json();
        setItems(data);
      } catch (e) {
        console.error("Failed to fetch items:", e);
        if (e instanceof Error) {
             setError(`Failed to load items: ${e.message}`);
        } else {
             setError("Failed to load items: An unknown error occurred.");
        }
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

  // useEffect hook to fetch initial items
  useEffect(() => {
    fetchAllItems(); // Fetch all items on initial load
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Implement Search Handler ---
  const handleSearch = async (query: string) => {
    // If the query is empty, fetch all items again
    if (!query.trim()) {
      fetchAllItems();
      return;
    }

    console.log("Searching for:", query);
    setLoading(true); // Show loading indicator during search
    setError(null);   // Clear previous errors
    setIsSearching(true); // Indicate that the current list is search results
    try {
      // Fetch search results from the backend
      const response = await fetch(`${API_URL}/items/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Search failed! status: ${response.status}`);
      }
      const searchResults: Item[] = await response.json();
      setItems(searchResults); // Update state with search results
    } catch (e) {
      console.error("Search failed:", e);
      if (e instanceof Error) {
           setError(`Search failed: ${e.message}`);
      } else {
           setError("Search failed: An unknown error occurred.");
      }
      setItems([]); // Clear items on search error
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };
  // --- End Search Handler ---

  // Updated addToCart function (basic implementation)
  const addToCart = (itemToAdd: Item) => {
    console.log("Attempting to add to cart:", itemToAdd.Title || itemToAdd['Variant SKU']);
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item['Variant SKU'] === itemToAdd['Variant SKU']
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        console.log(`Increased quantity for ${itemToAdd['Variant SKU']}`);
        return updatedCart;
      } else {
        console.log(`Adding new item ${itemToAdd['Variant SKU']}`);
        // Ensure price is a number when adding to cart
        const numericPriceItem = {
            ...itemToAdd,
            'Variant Price': parsePrice(itemToAdd['Variant Price'])
        };
        return [...prevCart, { ...numericPriceItem, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (skuToRemove: string) => {
    console.log("Removing from cart SKU:", skuToRemove);
    // TODO: Implement remove from cart logic
  };

  // --- Calculate Cart Total ---
  const cartTotal = cart.reduce((sum, item) => {
      // Use the helper function to ensure price is a number
      const price = parsePrice(item['Variant Price']);
      return sum + (price * item.quantity);
  }, 0);


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sticky Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center">Single-Page Ordering</h1>
      </header>

      <main className="container mx-auto p-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Main Content Area (Items List & Search) */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          {/* Render the SearchBar component */}
          <SearchBar onSearch={handleSearch} />

          {/* Display Loading State */}
          {loading && <p className="text-center text-gray-500 dark:text-gray-400 py-10">Loading...</p>}

          {/* Display Error State */}
          {error && <p className="text-center text-red-500 py-10">Error: {error}</p>}

          {/* Display Item List using the component */}
          {!loading && !error && (
            <ItemList items={items} onAddToCart={addToCart} />
          )}
          {/* Show message if search returned no results */}
          {!loading && !error && isSearching && items.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">No items found matching your search.</p>
          )}
        </div>

        {/* Sidebar Area (Cart & Chat) */}
        <div className="md:col-span-1 space-y-6">
           {/* Sticky Cart Section */}
           <div className="bg-white dark:bg-gray-800 p-4 rounded shadow sticky top-20"> {/* Adjust top value based on header height */}
              {/* <Cart cartItems={cart} onRemoveFromCart={removeFromCart} /> */} {/* Cart component placeholder */}
              <h2 className="text-xl font-semibold mb-4">Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
              {/* Basic Cart Display (Temporary) */}
              {cart.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">Your cart is empty.</p>
              ) : (
                <ul className="text-sm space-y-1 max-h-60 overflow-y-auto">
                  {cart.map(cartItem => {
                    const itemPrice = parsePrice(cartItem['Variant Price']);
                    const lineTotal = (itemPrice * cartItem.quantity).toFixed(2);
                    return (
                      <li key={cartItem['Variant SKU']} className="flex justify-between items-center">
                        <span>{cartItem.Title || cartItem['Variant SKU']} (x{cartItem.quantity})</span>
                        <span>${lineTotal}</span>
                      </li>
                    );
                   })}
                </ul>
              )}
              {/* Use the calculated cartTotal */}
              <p className="font-semibold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  Total: ${cartTotal.toFixed(2)}
              </p>
           </div>
           {/* Chat Query Section */}
           <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              {/* <ChatInterface apiUrl={API_URL} /> */} {/* Chat component placeholder */}
              <h2 className="text-xl font-semibold mb-4">Chat Query</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">(Chat component will go here)</p>
           </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center p-4 mt-8 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        My Ordering App &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
