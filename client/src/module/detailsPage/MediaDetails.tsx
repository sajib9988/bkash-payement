"use client";

import { Button } from "@/components/ui/button";
import { Media } from "@/type/type";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MediaDetailsProps {
  media: Media;
  hasPurchased: boolean;
}

const MediaDetails = ({ media, hasPurchased }: MediaDetailsProps) => {
  const router = useRouter();
  const data= hasPurchased

  // console.log('has', hasPurchased)
  const releaseDate = media?.releaseDate
    ? new Date(media.releaseDate).toLocaleDateString()
    : "N/A";

  return (
    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 border bg-green-200 border-white p-4 rounded-md shadow-sm">
      {/* Media Poster */}
      <div>
        <Image
         src={media.thumbnail as string  }
          alt="media poster"
          width={500}
          height={500}
          className="rounded-md w-full object-cover h-80"
        />
      </div>

      {/* Media Info */}
      <div className="bg-white rounded-md p-4 flex flex-col justify-between">
        <div>
          <h2 className="font-bold text-xl mb-4">{media?.title}</h2>
          <p className="text-justify text-gray-500 font-light text-sm mb-3">
            {media?.description}
          </p>

          <div className="flex flex-wrap gap-3 text-gray-500 text-xs mb-5">
            <span className="rounded-full px-4 py-1 bg-gray-100">
              Genre: {media?.genre}
            </span>
            <span className="rounded-full px-4 py-1 bg-gray-100">
              Release: {releaseDate}
            </span>
            <span className="rounded-full px-4 py-1 bg-gray-100">
              Type: {media?.type}
            </span>
          </div>

          <hr className="my-2" />
          <p className="font-bold mb-2">Price: ${media?.amount}</p>
          <hr className="my-2" />
        </div>

        <Button
          className="w-full mt-5"
          onClick={() =>
            router.push(
              hasPurchased ? `/watch/${media.id}` : `/cart/${media.id}`
            )
          }
        >
          {hasPurchased ? "Watch Now" : "Buy / Rent Now"}
        </Button>
      </div>
    </div>
  );
};

export default MediaDetails;
