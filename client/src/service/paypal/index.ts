'use server'

import { cookies } from "next/headers";
import { CapturePaymentResponse, CreateInvoicePayload, CreateOrderBody } from "./type";

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_API!;
};

// ✅ Create Order
export const createPaypalOrder = async (payload: CreateOrderBody, dbOrderId: string) => {
  const token = (await cookies()).get("accessToken")?.value;

  const response = await fetch(`${getBaseUrl()}/paypal/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`, 
    },
    body: JSON.stringify({ ...payload, dbOrderId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

 const result = await response.json(); 
  return result.data; // Assuming the response has a 'data' field with the order details
};

// This will send a POST request to your local server to capture the PayPal payment and update your DB order.
// ✅ Capture Payment
export const capturePayment = async (
  paypalOrderId: string,
  dbOrderId: string,
  
) => {
  const token = (await cookies()).get("accessToken")?.value;

  const response = await fetch(`${getBaseUrl()}/paypal/order/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
    body: JSON.stringify({ dbOrderId }),
    
  
  });
  if (!response.ok) {
    throw new Error(`Failed to capture payment: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
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
    body: JSON.stringify({ invoiceId }), // Assuming server expects this
  });

  if (!response.ok) {
    throw new Error(`Failed to send invoice: ${response.statusText}`);
  }

   const result = await response.json(); 
  return result.data; ;
};