"use server";

import { ICreateOrderPayload, IEstimatePayload } from "@/type/type";


const getBaseUrl = () => {
  return "https://courier-api-sandbox.pathao.com";
}

export const estimateShipping = async (payload: IEstimatePayload) => {
  const res = await fetch(`${getBaseUrl()}/pathao/estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: payload }),
  });

  const result = await res.json();
  return result;
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
  return result;
};
