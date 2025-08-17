import axios from "axios";
import { ICreateOrderPayload, IEstimatePayload } from "./pathao.interface";
import { City ,Zone, Area} from "./pathao.type";
import { fetchWithAuth } from "./utils/Fetcher";

export const getStoreInfoService = async () => {
  const url = `${process.env.PATHAO_API_BASE}/aladdin/api/v1/merchant/store`;
  return await fetchWithAuth(url);
};

export const getCityListService = async (): Promise<{ data: { data: City[] } }> => {
  const url = `${process.env.PATHAO_API_BASE}/aladdin/api/v1/city-list`;
  return await fetchWithAuth(url);
};

export const getZoneListService = async (city_id: number): Promise<{ data: { data: Zone[] } }> => {
  const url = `${process.env.PATHAO_API_BASE}/aladdin/api/v1/cities/${city_id}/zone-list`;
  return await fetchWithAuth(url);
};

export const getAreaListService = async (zone_id: number): Promise<{ data: { data: Area[] } }> => {
  const url = `${process.env.PATHAO_API_BASE}/aladdin/api/v1/zones/${zone_id}/area-list`;

  return await fetchWithAuth(url);
  
};

export const trackOrderService = async (consignment_id: string) => {
  const url = `${process.env.PATHAO_API_BASE}/aladdin/api/v1/orders/${consignment_id}/info`;
  return await fetchWithAuth(url);
};

export const estimateShippingService = async (payload: IEstimatePayload) => {
  const requestBody = {
    store_id: 148058,
    item_type: payload.item_type,
    delivery_type: payload.delivery_type,
    item_weight: payload.item_weight,
    recipient_city: payload.recipient_city,
    recipient_zone: payload.recipient_zone,
  };

  const url = `${process.env.PATHAO_API_BASE}/aladdin/api/v1/merchant/price-plan`;

  return await fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
};

export const createOrderService = async (payload: ICreateOrderPayload) => {
  // Debug: Payload দেখার জন্য
  console.log("Pathao payload:", JSON.stringify(payload, null, 2));

  // Stop/remove করা হয়েছে
  // throw new Error("Stopping execution to inspect payload");

  const data = {
    ...payload,
    store_id: 148058, // নিশ্চিত হয়ে নেওয়া হলো
  };

  const url = `${process.env.PATHAO_API_BASE}/aladdin/api/v1/orders`;

  try {
    const response = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Pathao order creation failed: ${JSON.stringify(errData)}`);
    }

    const result = await response.json();
    console.log("Pathao order created successfully:", result);
    return result;
  } catch (err) {
    console.error("❌ Pathao order creation error:", err);
    throw err; // Optional: rethrow to handle in capturePayment
  }
};

