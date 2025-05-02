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
        {/* Container needs relative positioning for fill layout */}
        <div className="relative w-10 h-10 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
           {/* --- UPDATED IMAGE COMPONENT --- */}
           <Image
             src={displayImgSrc}
             alt={item.Title || 'Cart item image'}
             fill // Use fill instead of layout="fill"
             sizes="40px" // Provide sizes prop when using fill (match container size)
             className="object-cover" // Use Tailwind class for object-fit
             onError={(e) => {
               (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
               (e.target as HTMLImageElement).srcset = "";
             }}
           />
           {/* --- END UPDATE --- */}
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
          Remove
        </button>
      </div>
    </li>
  );
};

export default CartItem;
