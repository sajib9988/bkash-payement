import axios from "axios";
import { ICreateOrderPayload, IEstimatePayload } from "./pathao.interface";

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

const getAccessToken = async () => {
  // Check if token is still valid (add 5 minute buffer)
    console.log("🔐 Using ENV:", {
    base: process.env.PATHAO_API_BASE,
    client_id: process.env.PATHAO_CLIENT_ID,
    username: process.env.PATHAO_USERNAME,
  });
  if (accessToken && tokenExpiry && Date.now() < (tokenExpiry - 300000)) {
    console.log('✅ Using existing token');
    return accessToken;
  }

  console.log('🔄 Getting new access token...');
  
  try {
    const res = await axios.post(
      `${process.env.PATHAO_API_BASE}/aladdin/api/v1/issue-token`,
      {
        client_id: process.env.PATHAO_CLIENT_ID,
        client_secret: process.env.PATHAO_CLIENT_SECRET,
        grant_type: "password",
        username: process.env.PATHAO_USERNAME,
        password: process.env.PATHAO_PASSWORD,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('✅ Token response:', {
      success: !!res.data.access_token,
      expires_in: res.data.expires_in
    });

    accessToken = res.data.access_token;
    console.log('🔑 Access Token:', accessToken);
    tokenExpiry = Date.now() + (res.data.expires_in * 1000); // Convert to milliseconds
    
    return accessToken;
  } catch (error: any) {
    console.error("❌ Failed to get access token:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Reset token info on failure
    accessToken = null;
    tokenExpiry = null;
    
    throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
  }
};

// ✅ Retry logic যোগ করা হয়েছে
const makeAuthenticatedRequest = async (config: any): Promise<any> => {
  const token = await getAccessToken();

  const requestConfig = {
    ...config,
    headers: {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  try {
    console.log(`🔍 Making request to: ${config.url}`);
    const response = await axios(requestConfig);
    console.log('✅ Request successful');
    return response;
  } catch (error: any) {
    console.error(`❌ Request failed:`, {
      status: error.response?.status,
      url: config.url,
      message: error.message,
    });

    throw error; // সরাসরি ব্যর্থ হবে, পুনরায় চেষ্টা করবে না
  }
};

export const estimateShippingService = async (payload: IEstimatePayload) => {
  const config = {
    method: 'post',
    url: `${process.env.PATHAO_API_BASE}/aladdin/api/v1/merchant/price-plan`,
    data: {
     store_id: Number(process.env.PATHAO_STORE_ID), 
      item_type: payload.item_type,      // ✅ Already number from validation
      delivery_type: payload.delivery_type,  // ✅ Already number
      item_weight: payload.item_weight,       // ✅ Already number
      recipient_city: payload.recipient_city, // ✅ Already number
      recipient_zone: payload.recipient_zone, // ✅ Already number
    }
  };

  console.log("📤 Sending to Pathao API:", config.url, config.data); // Debug log
  const res = await makeAuthenticatedRequest(config);
  console.log("✅ Estimate Shipping API response:", res);
    // console.log("📦 Shipping Estimate Result:", res.data);
  return res.data;

};

export const createOrderService = async (payload: ICreateOrderPayload) => {
  const config = {
    method: 'post',
    url: `${process.env.PATHAO_API_BASE}/aladdin/api/v1/orders`,
    data: {
      ...payload,
      store_id: parseInt(process.env.PATHAO_STORE_ID || '1'), // ✅ ENV থেকে নিন
    },
  };

  const res = await makeAuthenticatedRequest(config);
  console.log("Create Order API response:", res.data);
  return res.data;
};

export const trackOrderService = async (consignment_id: string) => {
  const config = {
    method: 'get',
    url: `${process.env.PATHAO_API_BASE}/aladdin/api/v1/orders/${consignment_id}/info`
  };

  const res = await makeAuthenticatedRequest(config);
  return res.data;
};

// ✅ এই function টাই মূল সমস্যা ছিল
// Updated pathao.service.ts - Replace your existing getCityListService function
export const getCityListService = async () => {
  console.log('🔍 Fetching city list from Pathao API...');
  
  const config = {
    method: 'get',
    url: `${process.env.PATHAO_API_BASE}/aladdin/api/v1/city-list`,
  };

  const res = await makeAuthenticatedRequest(config);
  console.log("✅ City List API response:", {
    success: true,
    dataLength: res.data?.data?.length || 0,
  });

  return res.data;
};


export const getZoneListService = async (city_id: number) => {
  console.log(`🔍 Fetching zones for city_id: ${city_id}`);
  
  const config = {
    method: 'get',
    url: `${process.env.PATHAO_API_BASE}/aladdin/api/v1/cities/${city_id}/zone-list`
  };

  const res = await makeAuthenticatedRequest(config);
  console.log(`✅ Zone List API response for city ${city_id}:`, {
    success: true,
    dataLength: res.data?.data?.length || 0
  });
  return res.data;
};

export const getAreaListService = async (zone_id: number) => {
  console.log(`🔍 Fetching areas for zone_id: ${zone_id}`);
  
  const config = {
    method: 'get',
    url: `${process.env.PATHAO_API_BASE}/aladdin/api/v1/zones/${zone_id}/area-list`
  };

  const res = await makeAuthenticatedRequest(config);
  console.log(`✅ Area List API response for zone ${zone_id}:`, {
    success: true,
    dataLength: res.data?.data?.length || 0
  });
  return res.data;
};