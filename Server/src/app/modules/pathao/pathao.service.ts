import axios from "axios";
import { ICreateOrderPayload, IEstimatePayload } from "./pathao.interface";


let accessToken: string | null = null;

const getAccessToken = async () => {
  if (accessToken) return accessToken;

  const res = await axios.post(
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/merchant/authorize`,
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
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/orders/estimate`,
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
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/orders`,
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
    `${process.env.PATHAO_API_BASE}/aladdin/api/v1/orders/track?tracking_number=${tracking_number}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
