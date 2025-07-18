'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IProduct, ICartItem } from '@/type/type';
import { toast } from 'sonner';

interface CartContextType {
  cart: ICartItem[];
  addToCart: (product: IProduct, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isClient]);

const addToCart = (product: IProduct) => {
  const existingItem = cart.find(item => item.product.id === product.id);

  if (existingItem) {
    // Product already in cart, show a toast or ignore
    console.log("Product already in cart, skipping add");
    toast.info("এই প্রোডাক্ট ইতিমধ্যে কার্টে আছে।");
    return; // ❌ Do not add again
  }

  // ✅ Add new product to cart
  const newCartItem = { product, quantity: 1 };
  const updatedCart = [...cart, newCartItem];
  setCart(updatedCart);
  localStorage.setItem("cart", JSON.stringify(updatedCart));
  toast.success("কার্টে যুক্ত করা হয়েছে!");
};



  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart.filter((item) => item.product.id !== productId);
      }
      return prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
