'use server'

import { cookies } from "next/headers";



export const getDistricts = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/shipping/districts`);
  console.log("Fetching districts from API:", response);
  return response.json();
};

export const getShippingCost = async (zone: string, weight: number) => {
    const accessToken = (await cookies()).get("accessToken")?.value;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/shipping?zone=${zone}&weight=${weight}`
    , {
      method: "GET",
      headers: {
        Authorization: accessToken as string,
      },
    }
  );
  console.log("Fetching shipping cost from API:", response);
  return response.json();
  
};
