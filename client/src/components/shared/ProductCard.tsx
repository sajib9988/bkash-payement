'use client';

import React from 'react';
import { IProduct } from '@/type/type';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: IProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="border rounded-lg p-4 flex flex-col items-center text-center shadow-md">
      <Image
        src={product.image}
        alt={product.name}
        width={200}
        height={200}
        className="rounded-md object-cover mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-700 mb-4">${product.price.toFixed(2)}</p>
      <Button onClick={() => addToCart(product, 1)} className="mt-auto">
        Add to Cart
      </Button>
    </div>
  );
};

export default ProductCard;
