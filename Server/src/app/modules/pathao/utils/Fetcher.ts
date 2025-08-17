import { PathaoAccessToken } from "./PathaoAccessToken";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await PathaoAccessToken();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // ✅ Enhanced error logging
    console.error("❌ Pathao API Error Details:", {
      url,
      method: options.method || 'GET',
      status: response.status,
      statusText: response.statusText,
      requestHeaders: headers,
      requestBody: options.body,
      responseData: data,
      timestamp: new Date().toISOString()
    });
    
    // Extract specific error message
    const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
};