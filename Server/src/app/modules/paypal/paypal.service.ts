
import { prisma } from "../../middleware/prisma";
import { createOrderService } from "../pathao/pathao.service";
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

  const existingOrder = await prisma.order.findFirst({
    where: { id: dbOrderId, status: { in: ["PENDING"] } }
  });

  if (!existingOrder) {
    throw new Error(`⚠️ Order not found with ID: ${dbOrderId} or not pending.`);
  }

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

  const paymentId = data?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const buyerInfo = data.payer;
  const shippingInfo = data.purchase_units?.[0]?.shipping;
  const amount = parseFloat(
    data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0"
  );

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
        paypalOrderId,
        payerId: buyerInfo?.payer_id ?? existingOrder.payerId,
        payerEmail: buyerInfo?.email_address ?? existingOrder.payerEmail,
        payerCountryCode: buyerInfo?.address?.country_code ?? existingOrder.payerCountryCode ?? "N/A",
        paymentId: payment.id,
      },
    });

    return [payment, updated];
  });

  console.log("✅ Payment captured and order updated successfully");

  // 📦 PayPal capture শেষে Pathao Order তৈরি
  try {
    await createOrderService({
      data: {
        name: existingOrder.shippingName,
        phone: existingOrder.shippingPhone,
        address: existingOrder.shippingAddress,
      },
      selectedDistrict: {
        id: existingOrder.pathaoRecipientCityId,
        name: existingOrder.district,
      },
      selectedZone: {
        id: existingOrder.pathaoRecipientZoneId,
        name: existingOrder.zone,
      },
      cart: existingOrder.cartItems,
      total: updatedOrder.totalAmount,
      shippingCost: existingOrder.shippingCost,
      userId: existingOrder.userId,
      paymentId: newPayment.id,
      paymentMethod: "PayPal",
    });

    console.log("✅ Pathao order created successfully");
  } catch (err) {
    console.error("❌ Failed to create Pathao order:", err);
  }

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
