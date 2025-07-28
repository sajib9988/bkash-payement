'use server'

import { ICreateOrderPayload, IEstimatePayload } from "@/type/type";
import { cookies } from "next/headers";

const getBaseUrl = () => {
  // Change this to your backend base URL if needed
  return `${process.env.NEXT_PUBLIC_BASE_API}/`;
};

export const estimateShipping = async (payload: IEstimatePayload) => {
  const res = await fetch(`${getBaseUrl()}/orders/estimate`,{ 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  console.log("Estimate Shipping Response:", res);
  return res.json();
};

export const createOrder = async (payload: ICreateOrderPayload) => {
  const res = await fetch(`${getBaseUrl()}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: payload }),
  });

  const result = await res.json();
  return result;
};

export const trackOrder = async (tracking_number: string) => {
  const res = await fetch(`${getBaseUrl()}/track/${tracking_number}`, {
    method: "GET",
  });

  const result = await res.json();
    console.log("Track Order Response:", result);
  return result;
};


export const getCityList = async () => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const res = await fetch(`${getBaseUrl()}/cities`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log("City List Response:", res);
  return res.json();
};

export const getZoneList = async (city_id: number) => {
   const accessToken = (await cookies()).get("accessToken")?.value;
  const res = await fetch(`${getBaseUrl()}/zones/${city_id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
    console.log("Zone List Response:", res);
  return res.json();
};

export const getAreaList = async (zone_id: number) => {
  const res = await fetch(`${getBaseUrl()}/areas/${zone_id}`, {
    method: "GET",
  });
    console.log("Area List Response:", res);
  return res.json();
};
