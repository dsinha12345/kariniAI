// src/components/ItemModal.tsx
"use client";

import React from 'react';

// Define the structure of the item prop, mirroring ItemProps but allowing for more fields potentially
interface ItemModalProps {
  item: {
    _id?: string;
    Handle: string;
    Title: string;
    Body?: string; // Description
    Vendor?: string;
    Type?: string;
    Tags?: string;
    'Variant SKU': string;
    'Variant Price': number | string;
    'Image Src': string;
    // Add other potential fields from the example if needed
    'Option1 Name'?: string;
    'Option1 Value'?: string;
    'Variant Grams'?: number;
    'Variant Inventory Qty'?: number;
    'Variant Inventory Policy'?: string;
    'Variant Fulfillment Service'?: string;
    'Variant Compare At Price'?: number | string | null;
    [key: string]: any; // Allow other fields
  } | null; // Allow item to be null when modal is closed
  onClose: () => void; // Function to close the modal
}

// --- Placeholder Image ---
const PLACEHOLDER_IMAGE = '/coming_soon.jpeg';

const ItemModal: React.FC<ItemModalProps> = ({ item, onClose }) => {
  if (!item) {
    return null; // Don't render anything if no item is selected
  }

  // Helper to safely display potentially missing data
  const displayValue = (value: any, defaultValue: string = 'N/A') => {
    if (value === null || typeof value === 'undefined' || value === '') {
      return defaultValue;
    }
    return String(value);
  };

  const price = parseFloat(String(item['Variant Price']));
  const displayPrice = !isNaN(price) ? price.toFixed(2) : '0.00';

  const compareAtPrice = item['Variant Compare At Price'] ? parseFloat(String(item['Variant Compare At Price'])) : null;
  const displayCompareAtPrice = compareAtPrice && !isNaN(compareAtPrice) ? compareAtPrice.toFixed(2) : null;

  const isValidUrl = (url: string | null | undefined): url is string =>
    typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));

  const displayImgSrc = isValidUrl(item['Image Src']) ? item['Image Src'] : PLACEHOLDER_IMAGE;

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close modal when clicking overlay
    >
      {/* Modal Content Box --- ADD 'relative' CLASS HERE --- */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col" // Added 'relative'
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {/* Close Button (Already exists!) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 z-10" // Slightly adjusted styling for better look/click target
          aria-label="Close modal"
        >
          {/* Using SVG for potentially better scaling/alignment */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
           {/* Original text 'X' if preferred: &times; */}
        </button>

        {/* Modal Body */}
        <div className="flex flex-col md:flex-row overflow-y-auto pt-8"> {/* Added pt-8 to prevent overlap with close button */}
          {/* Image Section */}
          <div className="w-full md:w-1/2 p-4 flex-shrink-0">
            <img
              src={displayImgSrc}
              alt={item.Title || 'Product image'}
              onError={(e) => {
                e.currentTarget.onerror = null; // Prevent infinite loop
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
              className="object-contain w-full h-64 md:h-full rounded"
            />
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{displayValue(item.Title)}</h2>

            <div className="mb-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${displayPrice}</span>
              {displayCompareAtPrice && (
                <span className="ml-2 text-sm line-through text-gray-500 dark:text-gray-400">${displayCompareAtPrice}</span>
              )}
            </div>

            {/* Use dangerouslySetInnerHTML only if item.Body contains trusted HTML */}
             {item.Body ? (
                 <div
                    className="text-gray-700 dark:text-gray-300 mb-4 prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: displayValue(item.Body) }}
                 />
             ) : (
                <p className="text-gray-700 dark:text-gray-300 mb-4">No description available.</p>
             )}


            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-semibold">SKU:</span> {displayValue(item['Variant SKU'])}</p>
              <p><span className="font-semibold">Type:</span> {displayValue(item.Type)}</p>
              <p><span className="font-semibold">Vendor:</span> {displayValue(item.Vendor)}</p>
              {item['Option1 Name'] && item['Option1 Value'] && (
                 <p><span className="font-semibold">{displayValue(item['Option1 Name'])}:</span> {displayValue(item['Option1 Value'])}</p>
              )}
              {/* Add more fields as needed */}
              <p><span className="font-semibold">Tags:</span> {displayValue(item.Tags)}</p>
              <p><span className="font-semibold">Inventory:</span> {displayValue(item['Variant Inventory Qty'])} ({displayValue(item['Variant Inventory Policy'])})</p>
            </div>

            {/* Add to Cart Button (Optional) */}
            {/* <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out">
              Add to Cart
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;