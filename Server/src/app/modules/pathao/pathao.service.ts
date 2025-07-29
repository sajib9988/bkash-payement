import axios from "axios";
import { ICreateOrderPayload, IEstimatePayload } from "./pathao.interface";

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

const getAccessToken = async () => {
  // Check if token is still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const res = await axios.post(
      `${process.env.PATHAO_API_BASE}/aladdin/api/v1/issue-token`,
      {
        client_id: process.env.PATHAO_CLIENT_ID,
        client_secret: process.env.PATHAO_CLIENT_SECRET,
        grant_type: "password",
        username: process.env.PATHAO_USERNAME,
        password: process.env.PATHAO_PASSWORD,
      }
    );

    accessToken = res.data.access_token;
    tokenExpiry = Date.now() + (res.data.expires_in * 1000); // Convert to milliseconds
    
    return accessToken;
  } catch (error) {
    console.error("Failed to get access token:", error);
    throw new Error("Authentication failed");
  }
};

export const estimateShippingService = async (payload: IEstimatePayload) => {
  const token = await getAccessToken();

  const res = await axios.post(
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/merchant/price-plan`,
    {
      store_id: 1, // Replace with your actual store_id
      item_type: parseInt(payload.item_type),
      delivery_type: parseInt(payload.delivery_type), 
      item_weight: parseFloat(payload.item_weight),
      recipient_city: parseInt(payload.recipient_city),
      recipient_zone: parseInt(payload.recipient_zone),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data;
};

export const createOrderService = async (payload: ICreateOrderPayload) => {
  const token = await getAccessToken();

  const res = await axios.post(
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/orders`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
console.log( "Create Order API response:", res.data);
  return res.data;
};

export const trackOrderService = async (consignment_id: string) => {
  const token = await getAccessToken();

  const res = await axios.get(
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/orders/${consignment_id}/info`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getCityListService = async () => {
  const token = await getAccessToken();

  const res = await axios.get(
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/city-list`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
console.log("City List API response:", res.data);
  return res.data;
};

export const getZoneListService = async (city_id: number) => {
  const token = await getAccessToken();
  const res = await axios.get(
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/cities/${city_id}/zone-list`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getAreaListService = async (zone_id: number) => {
  const token = await getAccessToken();
  const res = await axios.get(
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/zones/${zone_id}/area-list`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};