'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Media } from '@/type/type';
import { getAllMedia } from '@/service/media';

interface MediaRowProps {
  title: string;
  category?: string;
}

const MediaCard = ({ title, category }: MediaRowProps) => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await getAllMedia();
        if (response?.data?.data?.length > 0) {
          setMediaList(response.data.data);
        }
      } catch (error) {
        // console.error('Error fetching media:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [category]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800 rounded-lg aspect-[2/3]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mediaList.map((item) => (
            <Link
              key={item.id}
              href={`/media/${item.id}`}
              className="block rounded-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/10"
            >
              <div className="aspect-[2/3] relative">
                <Image
                  src={item.thumbnail as string}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white font-medium text-sm md:text-base">{item.title}</h3>
                  <p className="text-white/70 text-xs">
                    {new Date(item.releaseDate).getFullYear()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
