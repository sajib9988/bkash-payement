"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Media, MediaResponse } from "@/type/type";

import image from "@/assets/dark knight.jpg";

const HeroBanner = () => {
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchMedia = async () => {
  //     try {
  //       const response: MediaResponse = await getAllMedia();
  //       // console.log(response)
  //       if (response.data.data.length > 0) {
  //         setMedia(response.data.data[0]);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching media:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchMedia();
  // }, []);



  if (loading) {
    return (
      <div className="h-[70vh] bg-black flex items-center justify-center text-white text-xl">
        Loading Hero Banner...
      </div>
    );
  }

  if (!media) {
    return (
      <div className="h-[70vh] bg-black flex items-center justify-center text-white text-lg">
        No media available
      </div>
    );
  }

  return (
    <section className="relative h-[70vh] w-full overflow-hidden bg-black">
      {/* Background Image */}
      <Image
  src={ image}
  alt={media.title}
  fill
  className="object-cover object-center brightness-95 contrast-110"
  priority
/>


      {/* Overlay gradient */}
    <div className="absolute inset-0  z-10" />


      {/* Content */}
      <div className="relative z-20 h-full container mx-auto px-4 flex flex-col justify-end pb-16 text-white">
        <div className="max-w-3xl  p-6 rounded-lg border border-white/10 shadow-lg">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {media.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm mb-3">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span>{media.rating ?? "N/A"}</span>
            </div>
            <span>•</span>
            <span>{new Date(media.releaseDate).getFullYear()}</span>
            <span>•</span>
            <span>{media.genre}</span>
          </div>

          <p className="line-clamp-3 text-white/70 mb-6 text-base sm:text-lg">
            {media.description}
          </p>

          <Link href={`/media/${media.id}`}>
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
