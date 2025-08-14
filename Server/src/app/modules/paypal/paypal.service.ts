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
  dbOrderId: string,     // DB এর order ID
  userId: string,
  shippingPhone: string
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
        body: JSON.stringify({}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ PayPal API Error:", JSON.stringify(data, null, 2));
    throw new Error(
      `Payment capture failed: Status ${response.status}, Details: ${JSON.stringify(data)}`
    );
  }

  // 2️⃣ Extract data
  const paymentId = data?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const buyerInfo = data.payer;
  const shippingInfo = data.purchase_units?.[0]?.shipping;
  const amount = parseFloat(
    data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0"
  );

  if (!shippingInfo || !buyerInfo) {
    throw new Error("Missing shipping or buyer info from PayPal response.");
  }

  // 3️⃣ Transaction: Payment create + Draft order update
  const [newPayment, updatedOrder] = await prisma.$transaction(async (tx) => {

    const payment = await tx.payment.create({
      data: {
        orderId: dbOrderId,
        userId,
        amount,
        transactionId: paymentId,
        status: "PAID",
        paymentGatewayData: data,
        billingName: buyerInfo.name?.given_name
          ? `${buyerInfo.name.given_name} ${buyerInfo.name.surname ?? ""}`
          : null,
        invoice: "INV-" + Date.now(),
        billingEmail: buyerInfo.email_address ?? null,
        billingPhone: shippingPhone ?? null,
        billingAddress: shippingInfo.address?.address_line_1 ?? null,
      },
    });
console.log("💳 PayPal capture response:", data);

    let order = await tx.order.findFirst({
      where: { id: dbOrderId, userId, status: { in: ["PENDING"] } },
    });
console.log("🔍 Fetched order from DB:", order);
    if (order) {
      order = await tx.order.update({
        where: { id: order.id },
        data: {
          totalAmount: amount,
          status: "PAID",
          paymentGateway: "paypal",
          paypalOrderId: paypalOrderId,
          payerId: buyerInfo?.payer_id ?? order.payerId,
          payerEmail: buyerInfo?.email_address ?? order.payerEmail,
          payerCountryCode: buyerInfo?.address?.country_code ?? order.payerCountryCode ?? "N/A",
          paymentId: payment.id,
        },
      });
    } else {
      console.warn("⚠️ [TX] No Draft/Pending order found!");
      order = null;
    }

    return [payment, order];
  });

  if (!updatedOrder) {
    console.warn("⚠️ No order was updated, skipping Pathao order creation.");
    return newPayment;
  }

  // 4️⃣ Pathao order create (if in Bangladesh)
  if (updatedOrder.shippingCountry === "Bangladesh") {
    try {
      if (!updatedOrder.pathaoRecipientCityId || !updatedOrder.pathaoRecipientZoneId) {
        throw new Error("Missing Pathao City/Zone ID on order");
      }

      const formattedPhone = updatedOrder.shippingPhone.replace("+880", "0");

      const pathaoPayload: ICreateOrderPayload = {
        store_id: 148058,
        merchant_order_id: updatedOrder.id,
        recipient_name: updatedOrder.shippingName,
        recipient_phone: formattedPhone,
        recipient_address: updatedOrder.shippingStreet,
        recipient_city: updatedOrder.pathaoRecipientCityId,
        recipient_zone: updatedOrder.pathaoRecipientZoneId,
        delivery_type: 48,
        item_type: 2,
        item_quantity: 1,
        item_weight: 0.5,
        item_description: `Order #${updatedOrder.id} - ${updatedOrder.totalAmount} BDT`,
        special_instruction: `PayPal Order ID: ${updatedOrder.paypalOrderId}`,
        amount_to_collect: 0,
      };

      const pathaoOrder = await createOrderService(pathaoPayload);
      console.log("✅ [PATHAO] Order created:", pathaoOrder);
    } catch (pathaoError: any) {
      console.error("❌ [PATHAO] Failed:", pathaoError.message);
    }
  }

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
