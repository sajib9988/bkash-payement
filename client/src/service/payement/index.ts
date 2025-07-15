"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

// Create Payment
export const createPayment = async (data: Record<string, any>) => {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("Unauthorized: No access token found");
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/payment/init-payment/${data.contentId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
        body: JSON.stringify(data),
      }
    );
console.log("API payment URL:", `${process.env.NEXT_PUBLIC_BASE_API}/payment/init-payment/${data.contentId}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Something went wrong");
    }

    revalidateTag("PAYMENT");
    return res.json();
  } catch (error: any) {
    return Error(error.message);
  }
};

// Validate Payment (IPN)
export const validatePayment = async (query: string) => {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("Unauthorized: No access token found");
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/payment/ipn?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: accessToken,
        },
        next: { tags: ["PAYMENT"] },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Something went wrong");
    }

    return res.json();
  } catch (error: any) {
    return Error(error.message);
  }
};

// Get My Payments
export const getMyPayments = async () => {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("Unauthorized: No access token found");
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/payment/my-payments`, {
      headers: {
        Authorization: accessToken,
      },
      next: { tags: ["PAYMENT"] },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Something went wrong");
    }

    return res.json();
  } catch (error: any) {
    return Error(error.message);
  }
};

