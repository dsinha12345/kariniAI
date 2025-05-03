// src/components/ItemList.tsx (or .jsx / .js)
"use client"; // May not be strictly necessary if Item handles all client interaction

import React from 'react';
import Item from './Item'; // Import the Item component
import ItemModal from './ItemModal'; // Import the ItemModal component

// Define the structure for items passed to this list
interface ItemData {
  _id?: string;
  Handle: string;
  Title: string;
  'Variant SKU': string;
  'Variant Price': number | string; // Allow string initially from data
  'Image Src': string;
  [key: string]: any;
}

// Define the props for the ItemList component
interface ItemListProps {
  items: ItemData[]; // An array of items
  onAddToCart: (item: ItemData) => void; // Function passed down to each Item
}

const ItemList: React.FC<ItemListProps> = ({ items, onAddToCart }) => {
  const [selectedItem, setSelectedItem] = React.useState<ItemData | null>(null);
  const openModal = (item: ItemData) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);
  // Handle the case where there are no items to display
  if (!items || items.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No items found.</p>;
  }

  return (
    // Using Tailwind CSS for a responsive grid layout
    // - grid: enables grid display
    // - gap-4: adds spacing between grid items
    // - grid-cols-1: default to 1 column on small screens
    // - sm:grid-cols-2: 2 columns on small screens and up
    // - lg:grid-cols-3: 3 columns on large screens and up
    // - xl:grid-cols-4: 4 columns on extra-large screens and up (optional)
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        // Render an Item component for each item in the array
        // Use a unique key for each item - MongoDB's _id is ideal if available, otherwise SKU
        <Item
          key={item._id || item['Variant SKU']}
          item={item}
          onAddToCart={onAddToCart} // Pass the addToCart function down
          onItemSelect={openModal}
        />
      ))}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ItemList;
