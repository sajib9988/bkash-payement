import axios from "axios";
import { ICreateOrderPayload, IEstimatePayload } from "../pathao.interface";

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

 export const PathaoAccessToken = async () => {
  // Check if token is still valid (add 5 minute buffer)
  //   console.log("🔐 Using ENV:", {
  //   base: process.env.PATHAO_API_BASE,
  //   client_id: process.env.PATHAO_CLIENT_ID,
  //   username: process.env.PATHAO_USERNAME,
  // });
  if (accessToken && tokenExpiry && Date.now() < (tokenExpiry - 300000)) {
    console.log('✅ Using existing token');
    return accessToken;
  }

  // console.log('🔄 Getting new access token...');
  
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


    accessToken = res.data.access_token;
    // console.log('🔑 Access Token:', accessToken);
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


