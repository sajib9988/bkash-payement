import { CreateOrderBody } from "./paypal.interface";
import { getAccessToken } from "./utils/PaypalAccessToken";

export const createOrder = async (payload: CreateOrderBody) => {
  const accessToken = await getAccessToken();
  console.log('access token form paypal', accessToken);

  const result = await fetch(`${process.env.paypal_Base_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
console.log("createOrder response server", result);
  const data = await result.json();
console.log("createOrder data server", data);
  if (!result.ok) { 
    throw new Error(`Order creation failed: ${JSON.stringify(data)}`);
  }

  return data;
};

export const capturePayment = async (orderId: string) => {
  const accessToken = await getAccessToken();

  const result = await fetch(`${process.env.paypal_Base_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    }
  });

  const data = await result.json();

  if (!result.ok) {
    throw new Error(`Payment capture failed: ${JSON.stringify(data)}`);
  }

  return data;
};

export const createInvoice = async (payload: any) => {
  const accessToken = await getAccessToken();

  const result = await fetch(`${process.env.paypal_Base_URL}/v2/invoicing/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await result.json();

  if (!result.ok) {
    throw new Error(`Invoice creation failed: ${JSON.stringify(data)}`);
  }

  return data;
};

export const trackOrder = async (orderId: string) => {
  const accessToken = await getAccessToken();

  const result = await fetch(`${process.env.paypal_Base_URL}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    }
  });

  const data = await result.json();

  if (!result.ok) {
    throw new Error(`Order tracking failed: ${JSON.stringify(data)}`);
  }

  return data;
};


export const sendInvoice = async (invoiceId: string) => {
  const accessToken = await getAccessToken();

  const response = await fetch(`${process.env.paypal_Base_URL}/v2/invoicing/invoices/${invoiceId}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();
  return result;
};
