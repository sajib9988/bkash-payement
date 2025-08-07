'use server';

import { ICreateOrderPayload, IEstimatePayload } from '@/type/type';
import { cookies } from 'next/headers';
import { fetchWrapper } from './fetchWrapper';


// BASE URL
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_API!;
};

// Access Token
const getAccessToken = async () => {
  const cookieStore = cookies();
  return (await cookieStore).get('accessToken')?.value;
};

// 1. Estimate Shipping Price
export const estimateShippingService = async (payload: IEstimatePayload) => {
  const token = await getAccessToken();
  const url = `${getBaseUrl()}/pathao/merchant/price-plan`;

  const result = await fetchWrapper(url, {
    method: 'POST',
    body: payload,
    token,
  });

  // console.log("📦 Shipping Estimate Result:", result);
  // console.log("📦 Shipping Estimate Final Price:", result?.data?.data?.final_price || 0);
  return result?.data?.data?.final_price || 0;
};

// 2. Create Order
export const createOrderService = async (payload: ICreateOrderPayload) => {
  const token = await getAccessToken();
  const url = `${getBaseUrl()}/pathao/orders`;

  const result = await fetchWrapper(url, {
    method: 'POST',
    body: payload,
    token,
  });

  return result;
};

// 3. Track Order
export const trackOrderService = async (tracking_number: string) => {
  const token = await getAccessToken();
  const url = `${getBaseUrl()}/pathao/orders?tracking_number=${tracking_number}`;

  const result = await fetchWrapper(url, {
    method: 'GET',
    token,
  });

  return result;
};

// 4. Get City List
export const getCityList = async () => {
  const token = await getAccessToken();
  const url = `${getBaseUrl()}/pathao/city-list`;

  const result = await fetchWrapper(url, {
    method: 'GET',
    token,
  });

  return result?.data?.data || [];
};

// 5. Get Zone List
export const getZoneList = async (city_id: number) => {
  const token = await getAccessToken();
  const url = `${getBaseUrl()}/pathao/cities/${city_id}/zone-list`;

  const result = await fetchWrapper(url, {
    method: 'GET',
    token,
  });

  console.log("✅ Zone List API response:", result?.data?.data || []);
  return result?.data?.data || [];
};

// 6. Get Area List
export const getAreaList = async (zone_id: number) => {
  const token = await getAccessToken();
  const url = `${getBaseUrl()}/pathao/zones/${zone_id}/area-list`;

  const result = await fetchWrapper(url, {
    method: 'GET',
    token,
  });

  return result?.data?.data || [];
};
