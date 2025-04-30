// src/components/SearchBar.tsx (or .jsx / .js)
"use client"; // Needed for useState

import React, { useState } from 'react';

// Define the props for the SearchBar component
interface SearchBarProps {
  onSearch: (query: string) => void; // Callback function to trigger search in parent
  initialQuery?: string; // Optional initial value for the search input
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialQuery = '' }) => {
  // State to hold the current value of the search input
  const [query, setQuery] = useState<string>(initialQuery);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission which reloads the page
    onSearch(query.trim()); // Call the parent's search function, trimming whitespace
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); // Update the state as the user types
  };

  return (
    // Using Tailwind CSS for styling the form
    <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search by Title or SKU..."
        aria-label="Search items"
        // Styling for the input field
        className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <button
        type="submit"
        // Styling for the search button
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
