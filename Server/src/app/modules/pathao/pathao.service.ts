import axios from "axios";
import { ICreateOrderPayload, IEstimatePayload } from "./pathao.interface";


let accessToken: string | null = null;

const getAccessToken = async () => {
  if (accessToken) return accessToken;

  const res = await axios.post(
    `${process.env.getBaseUrl}/aladdin/api/v1/merchant/authorize`,
    {
      username: process.env.PATHAO_USERNAME,
      password: process.env.PATHAO_PASSWORD,
      client_id: process.env.PATHAO_CLIENT_ID,
      client_secret: process.env.PATHAO_CLIENT_SECRET,
      grant_type: "password",
    }
  );

  accessToken = res.data?.data?.access_token;
  return accessToken;
};

export const estimateShippingService = async (payload: IEstimatePayload) => {
  const token = await getAccessToken();

  const res = await axios.post(
    `${process.env.getBaseUrl}/aladdin/api/v1/orders/estimate`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const createOrderService = async (payload: ICreateOrderPayload) => {
  const token = await getAccessToken();

  const res = await axios.post(
    `${process.env.getBaseUrl}/aladdin/api/v1/orders`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const trackOrderService = async (tracking_number: string) => {
  const token = await getAccessToken();

  const res = await axios.get(
    `${process.env.getBaseUrl}/aladdin/api/v1/orders/track?tracking_number=${tracking_number}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// pathao.service.ts (এর নিচে যুক্ত করো)

export const getCityListService = async () => {
  const token = await getAccessToken();

  const res = await axios.get(
    `${process.env.getBaseUrl}/aladdin/api/v1/city-list`, // ✔️ endpoint
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
    `${process.env.getBaseUrl}/aladdin/api/v1/cities/${city_id}/zone-list`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};

export const getAreaListService = async (zone_id: number) => {
  const token = await getAccessToken();
  const res = await axios.get(
    `${process.env.getBaseUrl}/aladdin/api/v1/zones/${zone_id}/area-list`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};
