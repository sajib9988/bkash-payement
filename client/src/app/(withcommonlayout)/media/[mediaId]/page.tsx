import MediaDetails from "@/module/detailsPage/MediaDetails";
import { getMediaById } from "@/service/media";
import { hasPaidForMedia } from "@/service/watch";

interface MediaDetailsPageProps {
  params: Promise<{
    mediaId: string;
  }>;
}

const MediaDetailsPage = async ({ params }: MediaDetailsPageProps) => {
  // ✅ Await params in Next.js 15
  const { mediaId } = await params;

  const res = await getMediaById(mediaId);
  const hasPurchased = await hasPaidForMedia(mediaId);

  return (
    <div className="mt-5">
      <MediaDetails media={res.data} hasPurchased={hasPurchased} />
    </div>
  );
};

export default MediaDetailsPage;