"use client";

import React, { useState, useEffect } from 'react';
import ItemList from '@/components/ItemList'; // Correctly imports ItemList
import SearchBar from '@/components/SearchBar';
import Cart from '@/components/Cart';
import ChatInterface from '@/components/ChatInterface';
import { motion } from 'framer-motion';

// Define the structure of an item based on your data.json and backend response
interface Item {
  _id?: string;
  Handle: string;
  Title: string;
  'Variant SKU': string;
  'Variant Price': number | string;
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
  const num = parseFloat(String(priceValue));
  return !isNaN(num) ? num : 0;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // --- Determine Header Height Offset for Sticky Sidebar ---
  // Adjust this value based on your actual header height + desired gap
  // Examples: top-20 (80px), top-24 (96px), top-28 (112px)
  const SIDEBAR_STICKY_TOP_OFFSET = 'top-24';

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Function to fetch all items from the backend
  const fetchAllItems = async () => {
    setLoading(true);
    setError(null);
    setIsSearching(false);
    try {
      const response = await fetch(`${API_URL}/items`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Item[] = await response.json();
      setItems(data);
    } catch (e) {
      console.error("Failed to fetch items:", e);
      const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to load items: ${errorMsg}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect hook to fetch all items and set initial dark mode
  useEffect(() => {
    fetchAllItems();

    // Check user's preferred color scheme
    // Use stored preference if available (e.g., from localStorage)
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Example: Add localStorage check here if you implement persistence
    setDarkMode(prefersDark);
  }, []);


  // Function to handle search requests
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchAllItems();
      return;
    }

    setLoading(true);
    setError(null);
    setIsSearching(true);
    try {
      const response = await fetch(`${API_URL}/items/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Search failed! status: ${response.status}`);
      }
      const searchResults: Item[] = await response.json();
      setItems(searchResults);
    } catch (e) {
      console.error("Search failed:", e);
      const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Search failed: ${errorMsg}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to add an item to the cart or increment its quantity
  const addToCart = (itemToAdd: Item) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item['Variant SKU'] === itemToAdd['Variant SKU']
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      } else {
        // Ensure price is parsed correctly when adding new item
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
    setCart(prevCart => prevCart.filter(item => item['Variant SKU'] !== skuToRemove));
  };


  return (
    // Apply 'dark' class here based on state
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Inner div manages background and text colors */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 relative transition-colors duration-300">

        {/* Sticky Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md p-6 sticky top-0 z-40 transition-colors duration-300">
           <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Karini Demo
            </h1>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  // Sun icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  // Moon icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {/* Cart Icon and Badge */}
              <div className="relative">
                 {/* Badge showing item count */}
                 {cart.reduce((total, item) => total + item.quantity, 0) > 0 && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                 )}
                {/* Cart icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Main content grid */}
        <main className="container mx-auto p-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-24">

          {/* Left Column: Product Listing (Scrollable) */}
          <motion.div
            className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-indigo-700 dark:text-indigo-400">Products</h2>
            <SearchBar onSearch={handleSearch} />

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {/* Error Message */}
             {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 my-6 rounded">
                <p className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Product List */}
            {!loading && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ItemList items={items} onAddToCart={addToCart} />
              </motion.div>
            )}

             {/* No Search Results Message */}
            {!loading && !error && isSearching && items.length === 0 && (
              <div className="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-xl text-gray-500 dark:text-gray-400">No items found matching your search.</p>
                <button
                  onClick={fetchAllItems}
                  className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  View all products
                </button>
              </div>
            )}
          </motion.div> {/* End Left Column */}

          {/* Right Column: Sidebar (Sticky) */}
          <motion.div
            // Apply sticky positioning here
            className={`md:col-span-1 space-y-6 sticky ${SIDEBAR_STICKY_TOP_OFFSET} self-start`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
              {/* Cart Component */}
              <Cart cartItems={cart} onRemoveFromCart={removeFromCart} />

              {/* Order Summary Card (Conditional) */}
              {cart.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-indigo-700 dark:text-indigo-400">Order Summary</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      {/* Calculate subtotal */}
                      <span>${cart.reduce((total, item) => total + (parsePrice(item['Variant Price']) * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span>Free</span> {/* Or calculate shipping */}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span>Calculated at checkout</span> {/* Or calculate tax */}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        {/* Calculate total */}
                        <span className="text-indigo-700 dark:text-indigo-400">${cart.reduce((total, item) => total + (parsePrice(item['Variant Price']) * item.quantity), 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                    Proceed to Checkout
                  </button>
                </div>
              )}

              {/* Store Information Card */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-indigo-700 dark:text-indigo-400">Store Information</h3>
                <div className="space-y-4">
                  {/* Location */}
                  <div className="flex items-start space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      112 Courtland St NE<br />
                      Atlanta, GA
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="flex items-start space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      (404) 232-5533
                    </div>
                  </div>
                  {/* Email */}
                  <div className="flex items-start space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      devanshmsinha@gmail.com
                    </div>
                  </div>
                </div>
             </div>
          </motion.div> {/* End Right Column */}

        </main>

        {/* Footer */}
         <footer className="bg-white dark:bg-gray-800 shadow-inner p-6 mt-8 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                {/* Footer Branding */}
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
                    Karini Demo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {/* Dynamically show current year */}
                    Providing quality products since {new Date().getFullYear()}
                  </p>
                </div>
                 {/* Social Media Links */}
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <span className="sr-only">Twitter</span>
                     <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                   </a>
                   <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                     <span className="sr-only">Instagram</span>
                     <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                       <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363.416 2.427.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                     </svg>
                   </a>
                </div>
              </div>
            </div>
         </footer>

        {/* Chat Interface (Positioned separately, likely fixed or absolute) */}
        <ChatInterface apiUrl={API_URL} />

      </div>
    </div>
  );
}