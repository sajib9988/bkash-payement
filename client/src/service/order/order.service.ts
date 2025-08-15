"use server";
import { ICreateOrderPayload, ICreateOrderResponse } from "@/type/type";
import { cookies } from "next/headers";

const getBaseUrl = () => process.env.NEXT_PUBLIC_BASE_API!;

export async function createDraftOrderService(
  payload: ICreateOrderPayload
): Promise<ICreateOrderResponse> {
  const token = (await cookies()).get("accessToken")?.value;
  const res = await fetch(`${getBaseUrl()}/orders/draft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
}

export async function getDraftOrderById(dbOrderId: string) {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) throw new Error("No access token found");

  const response = await fetch(`${getBaseUrl()}/orders/${dbOrderId}`, {
    method: "GET",
    headers: { Authorization: `${token}` },
  });

  if (!response.ok) throw new Error(`Failed to fetch draft order`);
  return response.json();
}

export async function getOrderByPaypalId(paypalOrderId: string) {
  const token = (await cookies()).get("accessToken")?.value;

  const response = await fetch(`${getBaseUrl()}/orders/by-paypal-id/${paypalOrderId}`, {
    method: "GET",
    headers: { Authorization: `${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch order by PayPal ID");
  }
  console.log("Response from getOrderByPaypalId:", response);
  return response.json();
}

