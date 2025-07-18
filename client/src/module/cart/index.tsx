'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

const ShoppingCart = () => {
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or <p>Loading...</p>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className="text-lg">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center border rounded-lg p-4 shadow-sm">
              <Image
                src={item.product.image?.[0]?.url || '/placeholder.jpg'}
                alt={item.product.title}
                width={80}
                height={80}
                className="rounded-md object-cover mr-4"
              />

              <div className="flex-grow">
                <h2 className="text-xl font-semibold">{item.product.title}</h2>
                <p className="text-gray-600">Price: ${item.product.price.toFixed(2)}</p>
                <div className="flex items-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateCartItemQuantity(item.product.id, parseInt(e.target.value))
                    }
                    className="w-16 text-center mx-2"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.product.id)}
                    className="ml-4"
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <p className="text-lg font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}

          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <h3 className="text-2xl font-bold">Total:</h3>
            <p className="text-2xl font-bold">${getCartTotal().toFixed(2)}</p>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearCart} className="mr-2">
              Clear Cart
            </Button>
            <Link href={'/checkout'}>Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
