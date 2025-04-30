// src/components/Item.tsx (or .jsx / .js)
"use client";

import React from 'react';
import Image from 'next/image';

// Define the structure of the item prop
interface ItemProps {
  item: {
    _id?: string;
    Handle: string;
    Title: string;
    'Variant SKU': string;
    'Variant Price': number | string; // Allow string initially from data
    'Image Src': string;
    [key: string]: any;
  };
  onAddToCart: (item: ItemProps['item']) => void;
}

// --- CHANGE HERE: Update placeholder path ---
// Make sure 'coming_soon.jpeg' is in your 'frontend/public/' directory
const PLACEHOLDER_IMAGE = '/coming_soon.jpeg';
// --- END CHANGE ---

const Item: React.FC<ItemProps> = ({ item, onAddToCart }) => {
  const {
    'Image Src': imgSrc = PLACEHOLDER_IMAGE, // Use the updated constant
    Title: title = 'Untitled Item',
    'Variant SKU': sku = 'N/A',
    'Variant Price': priceValue = 0
  } = item;

  const price = parseFloat(String(priceValue));
  const displayPrice = !isNaN(price) ? price.toFixed(2) : '0.00';

  const isValidUrl = (url: string | null | undefined): url is string =>
    typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));

  // Use the provided image source if valid, otherwise use the placeholder
  const displayImgSrc = isValidUrl(imgSrc) ? imgSrc : PLACEHOLDER_IMAGE;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800 flex flex-col">
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
  <img
    src={isValidUrl(imgSrc) ? imgSrc : PLACEHOLDER_IMAGE}
    alt={title || 'Product image'}
    onError={(e) => {
      e.currentTarget.onerror = null; // Prevent infinite loop
      e.currentTarget.src = PLACEHOLDER_IMAGE;
    }}
    className="object-contain w-full h-full transition-transform duration-300 ease-in-out hover:scale-105"
  />
</div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-1 truncate" title={title}>
          {title || 'No Title'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          SKU: {sku}
        </p>
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3 mt-auto">
          ${displayPrice}
        </p>
        <button
          onClick={() => onAddToCart(item)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Item;
