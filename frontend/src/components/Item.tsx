// src/components/Item.tsx
"use client";

import React from 'react';
// Keep Image import if you use Next.js Image component, otherwise remove
// import Image from 'next/image';

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
  onItemSelect: (item: ItemProps['item']) => void; // This triggers the modal
}

const PLACEHOLDER_IMAGE = '/coming_soon.jpeg'; // Ensure this path is correct

const Item: React.FC<ItemProps> = ({ item, onAddToCart, onItemSelect }) => {
  const {
    'Image Src': imgSrc = PLACEHOLDER_IMAGE,
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

  // --- Handler for the Add to Cart button click ---
  const handleAddToCartClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // <--- Stops the click from bubbling up to the parent div
    onAddToCart(item);     // Executes only the add to cart logic
  };

  return (
    // This main div still handles clicks for opening the modal
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800 flex flex-col cursor-pointer"
      onClick={() => onItemSelect(item)} // This will be triggered by clicks NOT on the button
    >
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <img
          src={displayImgSrc} // Use the determined source
          alt={title || 'Product image'}
          onError={(e) => {
            e.currentTarget.onerror = null; // Prevent infinite loop
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
          className="object-contain w-full h-full rounded" // Ensure object-contain fits image well
        />
      </div>
      {/* Make sure the content area itself doesn't have an unnecessary onClick if added previously */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="marquee-container mb-1" title={title || 'No Title'}>
          <h3 className="text-lg font-semibold marquee-text">
            {title || 'No Title'}
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          SKU: {sku}
        </p>
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3 mt-auto">
          ${displayPrice}
        </p>
        <button
          // Use the specific handler for the button
          onClick={handleAddToCartClick}
          // Add relative positioning and z-index to ensure the button is clearly clickable
          // and potentially above other elements if styling overlaps occur.
          className="relative z-10 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Item;