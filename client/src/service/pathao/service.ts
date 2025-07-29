'use server';

import { ICreateOrderPayload, IEstimatePayload } from '@/type/type';
import { cookies } from 'next/headers';

// ✅ সঠিক বেস URL পাওয়ার ফাংশন
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_API; // শেষে '/' নেই
};

// এক্সেস টোকেন পাওয়ার ফাংশন
const getAccessToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
};

// 1. শিপিং এস্টিমেট ক্যালকুলেট করুন
export const estimateShippingService = async (payload: IEstimatePayload) => {
  const token = await getAccessToken();

  const res = await fetch(`${getBaseUrl()}/pathao/merchant/price-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      store_id: 1, // আপনার actual store_id দিন
      item_type: parseInt(payload.item_type),
      delivery_type: parseInt(payload.delivery_type),
      item_weight: parseFloat(payload.item_weight),
      recipient_city: parseInt(payload.recipient_city),
      recipient_zone: parseInt(payload.recipient_zone),
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Shipping estimate failed');
  }

  return await res.json();
};

// 2. নতুন অর্ডার তৈরি করুন
export const createOrderService = async (payload: ICreateOrderPayload) => {
  const token = await getAccessToken();

  const res = await fetch(
    `${getBaseUrl()}/pathao/orders`, // ✅ সঠিক URL
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        store_id: 1, // আপনার actual store_id দিন
        merchant_order_id: payload.merchant_order_id,
        recipient_name: payload.recipient_name,
        recipient_phone: payload.recipient_phone,
        recipient_address: payload.recipient_address,
        recipient_city: payload.recipient_city,
        recipient_zone: payload.recipient_zone,
        recipient_area: payload.recipient_area,
        delivery_type: payload.delivery_type,
        item_type: payload.item_type,
        item_quantity: payload.item_quantity,
        item_weight: payload.item_weight,
        item_description: payload.item_description,
        special_instruction: payload.special_instruction,
        amount_to_collect: payload.amount_to_collect,
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { message: "Unknown error" };
    }
    throw new Error(error.message || "Order creation failed");
  }

  return await res.json();
};

// 3. অর্ডার ট্র্যাক করুন
export const trackOrderService = async (tracking_number: string) => {
  const token = await getAccessToken();

  const res = await fetch(
    `${getBaseUrl()}/pathao/orders?tracking_number=${tracking_number}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Track order failed');
  }

  return await res.json();
};

// 4. ✅ সব সিটি (শহর) এর তালিকা আনুন - সবচেয়ে গুরুত্বপূর্ণ ঠিক করা
export const getCityList = async () => {
  const accessToken = (await cookies()).get('accessToken')?.value;

  console.log('🔍 Fetching city list with token:', accessToken ? 'Token exists' : 'No token');
  console.log('🔍 API URL:', `${getBaseUrl()}/pathao/city-list`);

  const res = await fetch(`${getBaseUrl()}/pathao/city-list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  console.log('🔍 Response status:', res.status);
  console.log('🔍 Response headers:', Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ City list fetch failed:', errorText);
    throw new Error(`Failed to fetch city list: ${res.status} - ${errorText}`);
  }

  const result = await res.json();
  console.log('✅ City list response:', result);
  return result;
};

// 5. নির্দিষ্ট সিটির জন্য জোন লিস্ট আনুন
export const getZoneList = async (city_id: number) => {
  const accessToken = (await cookies()).get('accessToken')?.value;

  const res = await fetch(
    `${getBaseUrl()}/pathao/cities/${city_id}/zone-list`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Zone list fetch failed:', errorText);
    throw new Error(`Failed to fetch zone list: ${res.status} - ${errorText}`);
  }

  return await res.json();
};

// 6. নির্দিষ্ট জোনের জন্য আরিয়া লিস্ট আনুন
export const getAreaList = async (zone_id: number) => {
  const accessToken = (await cookies()).get('accessToken')?.value;

  const res = await fetch(
    `${getBaseUrl()}/pathao/zones/${zone_id}/area-list`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Area list fetch failed:', errorText);
    throw new Error(`Failed to fetch area list: ${res.status} - ${errorText}`);
  }

  return await res.json();
};