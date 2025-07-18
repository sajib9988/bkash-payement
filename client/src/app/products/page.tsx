'use client';

import ProductCard from '@/components/shared/ProductCard';
import { IProduct } from '@/type/type';
import React from 'react';

const products: IProduct[] = [
  {
    id: '1',
    name: 'Laptop',
    price: 1200.00,
    image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop',
  },
  {
    id: '2',
    name: 'Mouse',
    price: 25.00,
    image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Mouse',
  },
  {
    id: '3',
    name: 'Keyboard',
    price: 75.00,
    image: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Keyboard',
  },
  {
    id: '4',
    name: 'Monitor',
    price: 300.00,
    image: 'https://via.placeholder.com/150/FFFF00/000000?text=Monitor',
  },
];

const ProductsPage = () => {
  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
