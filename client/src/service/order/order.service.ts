'use server'
import { ICreateOrderPayload, ICreateOrderResponse } from "@/type/type";
import { cookies } from "next/headers";
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_API!;
};
export const createDraftOrderService = async (
  payload: ICreateOrderPayload
): Promise<ICreateOrderResponse> => {
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
  console.log('orderId', data)
  return data;
};
