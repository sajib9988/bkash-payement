'use server'

import { ICreateOrderPayload, IEstimatePayload } from "@/type/type";

const getBaseUrl = () => {
  // Change this to your backend base URL if needed
  return "http://localhost:5000/api/v1/pathao";
};

export const estimateShipping = async (payload: IEstimatePayload) => {
  const res = await fetch(`${getBaseUrl()}/estimate`, {
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
  const res = await fetch(`${getBaseUrl()}/pathao/order`, {
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
  const res = await fetch(`${getBaseUrl()}/pathao/track/${tracking_number}`, {
    method: "GET",
  });

  const result = await res.json();
    console.log("Track Order Response:", result);
  return result;
};


export const getCityList = async () => {
  const res = await fetch(`${getBaseUrl()}/cities`, {
    method: "GET",
  });
  console.log("City List Response:", res);
  return res.json();
};

export const getZoneList = async (city_id: number) => {
  const res = await fetch(`${getBaseUrl()}/zones/${city_id}`, {
    method: "GET",
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
