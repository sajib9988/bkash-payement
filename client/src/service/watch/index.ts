"use server"

import { cookies } from "next/headers";

export const hasPaidForMedia = async (mediaId: string) => {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!accessToken) {
      console.log("No access token found, user not authenticated");
      return false;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/watch/access/${mediaId}`,
      {
        method: "GET",
        headers: {
          Authorization: accessToken,
        },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch purchase status");
      return false;
    }

    const data = await res.json();
    console.log("watch", data);

    // ✅ শুধু access boolean return করো
    return data?.data?.access ?? false;
  } catch (error) {
    console.error("Error checking media payment status:", error);
    return false;
  }
};