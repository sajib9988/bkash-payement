"use client";

import { useUser } from "@/context/userContext";
import Payment from "@/module/payment/Payment";
import { getMediaById } from "@/service/media";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const CartPage = () => {
  const { user } = useUser();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const mediaId = params?.mediaId as string;

  useEffect(() => {
    const fetchData = async () => {
      if (!mediaId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getMediaById(mediaId);
        setContent(response?.data);
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mediaId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !content) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load content</h2>
          <p className="text-gray-400">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/2 mx-auto mt-10">
      <Payment content={content} user={user} />
    </div>
  );
};

export default CartPage;