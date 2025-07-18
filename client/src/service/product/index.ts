'use server'

import { cookies } from "next/headers";

export const createProduct = async (formData: FormData) => {
  const accessToken = (await cookies()).get("accessToken")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/product/create`, {
    method: "POST",
    headers: {
      Authorization: `${accessToken}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server error: ${res.status} ${res.statusText} - ${errorText}`);
  }
  const result = await res.json();
  return result;
};


export const getALLProduct = async () => {
 

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/product`, {
    method: "GET",
   

  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch products: ${res.status} - ${errorText}`);
  }

 const json = await res.json();
const products = json.data;
console.log('pr data', products)
return products

};
