'use server';

import { ICreateOrderPayload, IEstimatePayload } from '@/type/type';
import { cookies } from 'next/headers';

// বেস URL পাওয়ার ফাংশন
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_API; // ✅ শেষে '/' নেই
};

// এক্সেস টোকেন পাওয়ার ফাংশন (এটা আসলে user token, pathao token নয়)
const getAccessToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
};

// ✅ Common request function with better error handling
const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const userToken = await getAccessToken();
  const url = `${getBaseUrl()}${endpoint}`;
  
  console.log(`🔍 Making request to: ${url}`);
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(userToken && { Authorization: `Bearer ${userToken}` }),
      ...options.headers,
    },
    cache: 'no-store',
  };

  const res = await fetch(url, config);
  
  console.log(`📊 Response status: ${res.status} for ${endpoint}`);

  if (!res.ok) {
    let errorMessage;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || `HTTP ${res.status}`;
      console.error('❌ Request failed:', errorData);
    } catch {
      errorMessage = `HTTP ${res.status} - ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const result = await res.json();
  console.log(`✅ Request successful for ${endpoint}`);
  return result;
};

// 1. শিপিং এস্টিমেট ক্যালকুলেট করুন
export const estimateShippingService = async (payload: IEstimatePayload) => {
  return await makeRequest('/pathao/merchant/price-plan', {
    method: 'POST',
    body: JSON.stringify({
      item_type: parseInt(payload.item_type),
      delivery_type: parseInt(payload.delivery_type),
      item_weight: parseFloat(payload.item_weight),
      recipient_city: parseInt(payload.recipient_city),
      recipient_zone: parseInt(payload.recipient_zone),
    }),
  });
};

// 2. নতুন অর্ডার তৈরি করুন
export const createOrderService = async (payload: ICreateOrderPayload) => {
  return await makeRequest('/pathao/orders', {
    method: 'POST',
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
  });
};

// 3. অর্ডার ট্র্যাক করুন
export const trackOrderService = async (tracking_number: string) => {
  return await makeRequest(`/pathao/orders?tracking_number=${tracking_number}`);
};

export const getCityList = async () => {
  console.log('🔍 Client: Requesting city list...');
  
  try {
    const result = await makeRequest('/pathao/city-list');
    console.log('✅ Client: City list received:', {
      success: result.success,
      dataLength: result.data?.length || 0
    });
    return result?.data?.data;

  } catch (error: any) {
    console.error('❌ Client: City list failed:', error.message);
    throw new Error(`Failed to fetch city list: ${error.message}`);
  }
};





export const getZoneList = async (city_id: number) => {
  console.log(`🔍 Client: Requesting zones for city_id: ${city_id}`);
  
  try {
    const result = await makeRequest(`/pathao/cities/${city_id}/zone-list`);
    console.log('✅ Client: Zone list received:', {
      success: result.success,
      dataLength: result.data?.length || 0
    });
    return result;
  } catch (error: any) {
    console.error(`❌ Client: Zone list failed for city ${city_id}:`, error.message);
    throw new Error(`Failed to fetch zone list: ${error.message}`);
  }
};
















export const getAreaList = async (zone_id: number) => {
  console.log(`🔍 Client: Requesting areas for zone_id: ${zone_id}`);
  
  try {
    const result = await makeRequest(`/pathao/zones/${zone_id}/area-list`);
    console.log('✅ Client: Area list received:', {
      success: result.success,
      dataLength: result.data?.length || 0
    });
    return result;
  } catch (error: any) {
    console.error(`❌ Client: Area list failed for zone ${zone_id}:`, error.message);
    throw new Error(`Failed to fetch area list: ${error.message}`);
  }
};