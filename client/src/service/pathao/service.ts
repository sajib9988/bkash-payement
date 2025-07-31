'use server';

import { ICreateOrderPayload, IEstimatePayload } from '@/type/type';
import { cookies } from 'next/headers';

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
  
  console.log("🔍 Making request to:", url);
  console.log("📤 Payload:", payload);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  console.log("📥 Response status:", res.status);
  console.log("📥 Response OK:", res.ok);

  if (!res.ok) {
    let errorMessage = 'Shipping estimate failed';
    try {
      const err = await res.json();
      errorMessage = err.message || errorMessage;
      console.error("❌ Error response:", err);
    } catch (parseError) {
      console.error("❌ Failed to parse error response");
      errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const result = await res.json();
  console.log("✅ Success response:", result);
  return result;
};


// 2. Create Order
export const createOrderService = async (payload: ICreateOrderPayload) => {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/pathao/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Order creation failed');
  }

  return res.json();
};

// 3. Track Order
export const trackOrderService = async (tracking_number: string) => {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/pathao/orders?tracking_number=${tracking_number}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Tracking failed');
  }

  return res.json();
};

// 4. Get City List
export const getCityList = async () => {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/pathao/city-list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'City list fetch failed');
  }

  const result = await res.json();
  return result?.data?.data || [];
};

// 5. Get Zone List
export const getZoneList = async (city_id: number) => {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/pathao/cities/${city_id}/zone-list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Zone list fetch failed');
  }

  const result = await res.json();
  return result?.data?.data || [];
};

// 6. Get Area List
export const getAreaList = async (zone_id: number) => {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/pathao/zones/${zone_id}/area-list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Area list fetch failed');
  }

  return res.json();
};
