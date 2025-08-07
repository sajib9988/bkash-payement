'use server'

import { cookies } from "next/headers";
import { CapturePaymentResponse, CreateInvoicePayload, CreateOrderBody } from "./type";

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_API!;
};

// ✅ Create Order
export const createPaypalOrder = async (payload: CreateOrderBody) => {
  const token = (await cookies()).get("accessToken")?.value;

  const response = await fetch(`${getBaseUrl()}/paypal/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`, 
    },
    body: JSON.stringify(payload),
  });
 console.log("createPaypalOrder response", response);
  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

 const result = await response.json(); 
  console.log("createPaypalOrder result", result);
  return result.data; // Assuming the response has a 'data' field with the order details
};

// ✅ Capture Payment
export const capturePayment = async (orderId:string, userId: string) => {
  const token = (await cookies()).get("accessToken")?.value;

  const response = await fetch(`${getBaseUrl()}/paypal/order/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ` ${token}`, // ✅ FIXED
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to capture payment: ${response.statusText}`);
  }

   const result = await response.json(); 
  console.log("capture result", result);
  return result.data; ;
};


export const trackPaypalOrder = async (orderId: string) => {
  const token = (await cookies()).get("accessToken")?.value;

  const response = await fetch(`${getBaseUrl()}/paypal/order/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to track order: ${response.statusText}`);
  }

   const result = await response.json(); 
  console.log("track", result);
  return result.data; ;
};


export const createPaypalInvoice = async (payload: CreateInvoicePayload) => {
  const token = (await cookies()).get("accessToken")?.value;

  const response = await fetch(`${getBaseUrl()}/paypal/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create invoice: ${response.statusText}`);
  }

  const result = await response.json(); 
  console.log("in", result);
  return result.data; ;
};

export const sendPaypalInvoice = async (invoiceId: string) => {
  const token = (await cookies()).get("accessToken")?.value;

  const response = await fetch(`${getBaseUrl()}/paypal/invoice/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ` ${token}`,
    },
    // body: JSON.stringify({ invoiceId }), // Assuming server expects this
  });

  if (!response.ok) {
    throw new Error(`Failed to send invoice: ${response.statusText}`);
  }

   const result = await response.json(); 
  console.log("senfd invoive", result);
  return result.data; ;
};