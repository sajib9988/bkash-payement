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
    throw new Error(data?.message || "Request failed");
  }

  return data;
};