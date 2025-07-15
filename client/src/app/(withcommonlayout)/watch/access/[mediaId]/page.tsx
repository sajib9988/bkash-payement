// app/watch/access/[mediaId]/page.tsx
import RatingForm from "@/module/Review/RatingForm";
import ReviewForm from "@/module/Review/ReviewForm";
import { getMediaById } from "@/service/media";
import { hasPaidForMedia } from "@/service/watch";
import { redirect } from "next/navigation";

interface MediaData {
  id: string;
  title: string;
  videoUrl?: string;
  videoUrls?: string[];
  description: string;
  thumbnail?: string;
  genre?: string;
  type?: string;
}

interface WatchPageProps {
  params: Promise<{
    mediaId: string;
  }>;
}

const WatchPage = async ({ params }: WatchPageProps) => {
  // ✅ Await params in Next.js 15
  const { mediaId } = await params;
  console.log('mediaId:', mediaId);

  try {
    // Check if user has paid for this media
    const hasPurchased = await hasPaidForMedia(mediaId);
    
    if (!hasPurchased) {
      // Redirect to media details page if not purchased
      redirect(`/media/${mediaId}`);
    }

    // Get media data
    const response = await getMediaById(mediaId);
    
    // Debug log to see the response structure
    console.log("WatchPage - Full response:", response);
    console.log("WatchPage - Response data:", response?.data);
    
    const media: MediaData = response?.data;

    if (!media) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Media Not Found</h2>
            <p className="text-gray-400">The requested media could not be found.</p>
            <p className="text-xs text-gray-500 mt-2">Debug: {JSON.stringify(response)}</p>
          </div>
        </div>
      );
    }

    // Get the video URL - check both videoUrl and videoUrls
    const videoUrl = media.videoUrl || (media.videoUrls && media.videoUrls.length > 0 ? media.videoUrls[0] : null);

    if (!videoUrl) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Video Unavailable</h2>
            <p className="text-gray-400">The video for this media is not available.</p>
            <p className="text-xs text-gray-500 mt-2">Debug - Available URLs: {JSON.stringify(media.videoUrls)}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{media.title}</h1>
          <div className="flex gap-4 text-sm text-gray-400">
            {media.type && <span className="capitalize">{media.type}</span>}
            {media.genre && <span>{media.genre}</span>}
          </div>
        </div>
        
        <div className="aspect-video mb-6">
          <video
            src={videoUrl}
            controls
            className="w-full h-full rounded-lg shadow-lg bg-black"
            poster={media.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {media.description && (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-300 leading-relaxed">{media.description}</p>
          </div>
        )}

        {/* Review form */}
        <div className="bg-white p-6 text-black rounded-lg mt-6">
          <h2 className="text-xl font-semibold mb-3">Write a Review</h2>
          <ReviewForm mediaId={mediaId} />
        </div>

        {/* Rating form */}
        <div className="bg-gray-800 p-6 rounded-lg mt-6">
          <RatingForm mediaId={mediaId} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in WatchPage:", error);
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Video</h2>
          <p className="text-gray-400">There was an error loading the video. Please try again later.</p>
        </div>
      </div>
    );
  }
};

export default WatchPage;