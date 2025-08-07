import { prisma } from "../../middleware/prisma";
import { CreateOrderBody } from "./paypal.interface";
import { getAccessToken } from "./utils/PaypalAccessToken";

export const createOrder = async (payload: CreateOrderBody) => {
  const accessToken = await getAccessToken();
  console.log('access token from paypal', accessToken);

  const result = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...payload,
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      },
    }),
  });

  const data = await result.json();
  console.log("createOrder data server", data);
  
  if (!result.ok) {
    throw new Error(`PayPal error: ${data.message || 'Unknown error'}`);
  }

  return data;
};

;

export const capturePayment = async (
  order_id: string,
  userId: string,
  shippingPhone: string
) => {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${order_id}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
console.log('response from capturePayment', response);
  const data = await response.json();
  console.log("capturePayment data server", data);

  if (!response.ok) {
    throw new Error(`Payment capture failed: ${JSON.stringify(data)}`);
  }

  // Extract necessary data
  const buyerInfo = data.payer;
  const shippingInfo = data.purchase_units?.[0]?.shipping;
  const amount = parseFloat(data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0");

  // Defensive programming: fallback if some data is missing
  if (!shippingInfo || !buyerInfo) {
    throw new Error("Missing shipping or buyer info from PayPal response.");
  }

  // Save Order in DB
  const savedOrder = await prisma.order.create({
    data: {
      userId: userId,
      totalAmount: amount,
      shippingName: shippingInfo.name.full_name,
      shippingPhone: shippingPhone,
      shippingStreet: shippingInfo.address.address_line_1,
      shippingCity: shippingInfo.address.admin_area_2,
      shippingZip: shippingInfo.address.postal_code,
      shippingCountry: shippingInfo.address.country_code,
      paymentGateway: "paypal",
      paypalOrderId: data.id,
      payerId: buyerInfo.payer_id,
      payerEmail: buyerInfo.email_address,
      payerCountryCode: buyerInfo.address?.country_code ?? "N/A", // Optional chaining
      status: "PAID",
    },
  });

  return savedOrder;
};


export const createInvoice = async (payload: any) => {
  const accessToken = await getAccessToken();

  const result = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/invoicing/invoices`, {
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

  const result = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
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

  const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/invoicing/invoices/${invoiceId}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();
  return result;
};
