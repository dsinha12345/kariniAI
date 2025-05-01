// src/components/Cart.tsx
"use client";

import React from 'react';
import CartItem from "./CartItem" // Import the CartItem component

// Define the structure for cart items expected by this component
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

interface CartProps {
  cartItems: CartItemData[];
  onRemoveFromCart: (sku: string) => void; // Function to remove item by SKU
}

// Helper function (duplicate from CartItem, ideally move to utils)
const parsePrice = (priceValue: number | string | undefined | null): number => {
    const num = parseFloat(String(priceValue));
    return !isNaN(num) ? num : 0;
}

const Cart: React.FC<CartProps> = ({ cartItems, onRemoveFromCart }) => {
  // Calculate total quantity and price
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = parsePrice(item['Variant Price']);
    return sum + (price * item.quantity);
  }, 0);

  return (
    // Styling using Tailwind CSS
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow sticky top-20"> {/* Adjust top value based on header height */}
      <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        Cart ({totalQuantity})
      </h2>

      {cartItems.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Your cart is empty.
        </p>
      ) : (
        <>
          {/* List of cart items */}
          <ul className="space-y-1 max-h-80 overflow-y-auto mb-4 pr-2"> {/* Added max height and scroll */}
            {cartItems.map(item => (
              <CartItem
                key={item['Variant SKU']}
                item={item}
                onRemove={onRemoveFromCart} // Pass the remove function
              />
            ))}
          </ul>
          {/* Cart Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {/* Optional: Add Checkout Button */}
            {/* <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Proceed to Checkout
            </button> */}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

