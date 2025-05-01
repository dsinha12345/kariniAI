// src/components/CartItem.tsx
"use client";

import React from 'react';
import Image from 'next/image';

// Define the structure for cart items (includes quantity)
interface CartItemData {
  _id?: string;
  Handle: string;
  Title: string;
  'Variant SKU': string;
  'Variant Price': number | string; // Allow string initially
  'Image Src': string;
  quantity: number;
  [key: string]: any;
}

interface CartItemProps {
  item: CartItemData;
  onRemove: (sku: string) => void; // Function to remove item by SKU
}

// Helper function to safely parse price (can be moved to a utils file later)
const parsePrice = (priceValue: number | string | undefined | null): number => {
    const num = parseFloat(String(priceValue));
    return !isNaN(num) ? num : 0;
}

const PLACEHOLDER_IMAGE = '/coming_soon.jpeg'; // Use the same placeholder

const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
  const price = parsePrice(item['Variant Price']);
  const lineTotal = (price * item.quantity).toFixed(2);
  const displayImgSrc = item['Image Src'] && (item['Image Src'].startsWith('http://') || item['Image Src'].startsWith('https://'))
    ? item['Image Src']
    : PLACEHOLDER_IMAGE;

  return (
    <li className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center space-x-3">
        {/* Small Image Thumbnail */}
        <div className="relative w-10 h-10 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
           <Image
             src={displayImgSrc}
             alt={item.Title || 'Cart item image'}
             layout="fill"
             objectFit="cover" // Use cover for small thumbnails
             onError={(e) => {
               (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
               (e.target as HTMLImageElement).srcset = "";
             }}
           />
        </div>
        {/* Item Title and Quantity */}
        <div>
          <span className="block text-sm font-medium truncate max-w-[150px]" title={item.Title || item['Variant SKU']}>
            {item.Title || item['Variant SKU']}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            Qty: {item.quantity}
          </span>
        </div>
      </div>
      {/* Price and Remove Button */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium">${lineTotal}</span>
        <button
          onClick={() => onRemove(item['Variant SKU'])}
          title="Remove item"
          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-medium"
        >
          {/* Simple text remove button */}
          Remove
          {/* Or use an icon: */}
          {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg> */}
        </button>
      </div>
    </li>
  );
};

export default CartItem;
