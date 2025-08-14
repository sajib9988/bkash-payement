import { prisma } from "../../middleware/prisma";
import { CreateOrderBody } from "./paypal.interface";
import { createOrderService, getCityListService, getZoneListService } from "../pathao/pathao.service";
import { ICreateOrderPayload } from "../pathao/pathao.interface";
import { City, Zone } from "../pathao/pathao.type";
import { getAccessToken } from "./utils/PaypalAccessToken";

export const createOrder = async (payload: CreateOrderBody) => {
  const accessToken = await getAccessToken();
  // console.log('access token from paypal', accessToken);

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
        user_action: "PAY_NOW",
      
      },
    }),
  });

  const data = await result.json();
  // console.log("createOrder data server", data);
  
  if (!result.ok) {
    throw new Error(`PayPal error: ${data.message || 'Unknown error'}`);
  }

  return data;
};

;

export const capturePayment = async (
  paypalOrderId: string, // PayPal order ID
  dbOrderId: string      // DB order ID
) => {
  const accessToken = await getAccessToken();

  // 1️⃣ PayPal থেকে Payment Capture
  const response = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({})
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Payment capture failed: Status ${response.status}, Details: ${JSON.stringify(data)}`);
  }

  // 2️⃣ ডিবি থেকে অর্ডার বের করো
  const order = await prisma.order.findFirst({
    where: { id: dbOrderId, status: { in: ["PENDING"] } }
  });

  if (!order) {
    throw new Error("⚠️ Order not found or not pending.");
  }

  // 3️⃣ PayPal response থেকে প্রয়োজনীয় ডাটা
  const paymentId = data?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const buyerInfo = data.payer;
  const shippingInfo = data.purchase_units?.[0]?.shipping;
  const amount = parseFloat(data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0");

  // 4️⃣ Transaction: Payment create + Order update
  const [newPayment, updatedOrder] = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId: dbOrderId,
        userId: order.userId, // DB থেকে নিলাম
        amount,
        transactionId: paymentId,
        status: "PAID",
        paymentGatewayData: data,
        billingName: buyerInfo?.name?.given_name
          ? `${buyerInfo.name.given_name} ${buyerInfo.name.surname ?? ""}`
          : null,
        invoice: "INV-" + Date.now(),
        billingEmail: buyerInfo?.email_address ?? null,
        billingPhone: order.shippingPhone ?? null, // DB থেকে নিলাম
        billingAddress: shippingInfo?.address?.address_line_1 ?? null,
      },
    });

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        totalAmount: amount,
        status: "PAID",
        paymentGateway: "paypal",
        paypalOrderId,
        payerId: buyerInfo?.payer_id ?? order.payerId,
        payerEmail: buyerInfo?.email_address ?? order.payerEmail,
        payerCountryCode: buyerInfo?.address?.country_code ?? order.payerCountryCode ?? "N/A",
        paymentId: payment.id,
      },
    });

    return [payment, updated];
  });

  return updatedOrder;
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
