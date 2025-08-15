import { prisma } from "../../middleware/prisma";
import { CreateOrderBody } from "./paypal.interface";
import { getAccessToken } from "./utils/PaypalAccessToken";

/**
 * Create PayPal order (no DB PayPal ID linking here)
 */
export const createOrder = async (payload: CreateOrderBody) => {
  const accessToken = await getAccessToken();

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

  if (!result.ok) {
    throw new Error(`PayPal error: ${data.message || 'Unknown error'}`);
  }

  return data; // Only return PayPal order info, no DB changes yet
};

/**
 * Capture payment and update DB with PayPal ID only after success
 */
export const capturePayment = async (
  paypalOrderId: string,
  dbOrderId: string
) => {
  const accessToken = await getAccessToken();

  // 1️⃣ Ensure DB order exists and is pending
  const existingOrder = await prisma.order.findFirst({
    where: { id: dbOrderId, status: { in: ["PENDING"] } }
  });

  if (!existingOrder) {
    throw new Error(`⚠️ Order not found with ID: ${dbOrderId} or not pending.`);
  }

  console.log("✅ Found existing order:", existingOrder.id);

  // 2️⃣ Capture payment from PayPal (NO PayPal ID update yet)
  const response = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Payment capture failed: Status ${response.status}, Details: ${JSON.stringify(data)}`);
  }

  // 3️⃣ Extract payment details
  const paymentId = data?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const buyerInfo = data.payer;
  const shippingInfo = data.purchase_units?.[0]?.shipping;
  const amount = parseFloat(
    data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0"
  );

  // 4️⃣ Create payment record and update order with PayPal ID + payment info
  const [newPayment, updatedOrder] = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId: dbOrderId,
        userId: existingOrder.userId,
        amount,
        transactionId: paymentId,
        status: "PAID",
        paymentGatewayData: data,
        billingName: buyerInfo?.name?.given_name
          ? `${buyerInfo.name.given_name} ${buyerInfo.name.surname ?? ""}`
          : null,
        invoice: "INV-" + Date.now(),
        billingEmail: buyerInfo?.email_address ?? null,
        billingPhone: existingOrder.shippingPhone ?? null,
        billingAddress: shippingInfo?.address?.address_line_1 ?? null,
      },
    });

    const updated = await tx.order.update({
      where: { id: existingOrder.id },
      data: {
        totalAmount: amount,
        status: "PAID",
        paymentGateway: "paypal",
        paypalOrderId, // ✅ Set PayPal ID only now
        payerId: buyerInfo?.payer_id ?? existingOrder.payerId,
        payerEmail: buyerInfo?.email_address ?? existingOrder.payerEmail,
        payerCountryCode: buyerInfo?.address?.country_code ?? existingOrder.payerCountryCode ?? "N/A",
        paymentId: payment.id,
      },
    });

    return [payment, updated];
  });

  console.log("✅ Payment captured and order updated successfully");
  return updatedOrder;
};

/**
 * Create PayPal invoice
 */
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

/**
 * Track PayPal order
 */
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

/**
 * Send PayPal invoice
 */
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
