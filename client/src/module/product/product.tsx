"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

interface ProductImage {
  url: string;
  public_id: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

// API function (replace with your actual implementation)
const getALLProduct = async (): Promise<Product[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/product`, {
    method: "GET",
  });
  
  console.log('res jkjj', res);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch products: ${res.status} - ${errorText}`);
  }
  
  const result = await res.json();
  return result.data;
};

const Product: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample data based on your structure
  // const sampleProducts: Product[] = [
  //   {
  //     id: "65b52b5f-79f5-4573-a37f-1aa5bba231d2",
  //     title: "t shiii",
  //     description: "ddddddddddddddddd",
  //     price: 19,
  //     image: [
  //       {
  //         url: "https://res.cloudinary.com/dyqm6ffjt/image/upload/v1752690731/cumgtl0xpdgkaechrtrs.jpg",
  //         public_id: "cumgtl0xpdgkaechrtrs"
  //       },
  //       {
  //         url: "https://res.cloudinary.com/dyqm6ffjt/image/upload/v1752690731/ckhii7dymh4dapzqf69z.jpg",
  //         public_id: "ckhii7dymh4dapzqf69z"
  //       }
  //     ],
  //     createdAt: "2025-07-16T18:32:12.283Z",
  //     updatedAt: "2025-07-16T18:32:12.283Z"
  //   },
  //   {
  //     id: "65b52b5f-79f5-4573-a37f-1aa5bba231d3",
  //     title: "Premium Cotton T-Shirt",
  //     description: "High-quality cotton t-shirt with comfortable fit and stylish design",
  //     price: 29,
  //     image: [
  //       {
  //         url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
  //         public_id: "sample1"
  //       }
  //     ],
  //     createdAt: "2025-07-15T18:32:12.283Z",
  //     updatedAt: "2025-07-15T18:32:12.283Z"
  //   },
  //   {
  //     id: "65b52b5f-79f5-4573-a37f-1aa5bba231d4",
  //     title: "Casual Denim Jacket",
  //     description: "Stylish denim jacket perfect for casual outings and everyday wear",
  //     price: 59,
  //     image: [
  //       {
  //         url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&h=500&fit=crop",
  //         public_id: "sample2"
  //       }
  //     ],
  //     createdAt: "2025-07-14T18:32:12.283Z",
  //     updatedAt: "2025-07-14T18:32:12.283Z"
  //   }
  // ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Uncomment this line to use your actual API
        const products = await getALLProduct();
        
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Replace this with actual API call
        console.log('product data', products)
        setProducts(products);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-3"></div>
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading products</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Discover amazing products at great prices</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">No products found</div>
            <p className="text-gray-400">Check back later for new arrivals!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;