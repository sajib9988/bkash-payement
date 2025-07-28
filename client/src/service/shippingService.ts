'use server'

import { cookies } from "next/headers";



export const getDistricts = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/shipping/districts`);
  console.log("Fetching districts from API:", response);
  return response.json();
};

import { estimateShipping } from "./pathao";
import { IEstimatePayload } from "@/type/type";

export const estimatePathaoShipping = async (
  recipient_city: string,
  recipient_zone: string,
  item_weight: number
) => {
  const payload: IEstimatePayload = {
    item_type: "parcel", // Assuming a default item type
    recipient_city,
    recipient_zone,
    delivery_type: "regular", // Assuming a default delivery type
    item_weight: item_weight.toString(), // Convert weight to string as per API
  };
  const result = await estimateShipping(payload);
  return result;
};
