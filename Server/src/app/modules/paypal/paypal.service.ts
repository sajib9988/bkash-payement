import { prisma } from "../../middleware/prisma";
import { CreateOrderBody } from "./paypal.interface";
import { createOrderService, getCityListService, getZoneListService } from "../pathao/pathao.service";
import { ICreateOrderPayload } from "../pathao/pathao.interface";
import { Zone } from "../pathao/pathao.type";
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
        user_action: "PAY_NOW",
      
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

  // PayPal থেকে Payment Capture
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

  const data = await response.json();
  console.log("capturePayment data server", data);

  if (!response.ok) {
    throw new Error(
      `Payment capture failed: Status ${response.status}, Details: ${JSON.stringify(data)}`
    );
  }

  // প্রয়োজনীয় ডাটা এক্সট্রাক্ট
  const paymentId = data?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const buyerInfo = data.payer;
  const shippingInfo = data.purchase_units?.[0]?.shipping;
  const amount = parseFloat(
    data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0"
  );

  if (!shippingInfo || !buyerInfo) {
    throw new Error("Missing shipping or buyer info from PayPal response.");
  }

  // Prisma Transaction শুরু
  const [newPayment, savedOrder] = await prisma.$transaction([
    prisma.payment.create({
      data: {
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
    }),

    prisma.order.create({
      data: {
        userId,
        totalAmount: amount,
        shippingName: shippingInfo.name.full_name,
        shippingPhone,
        shippingStreet: shippingInfo.address.address_line_1,
        shippingCity: shippingInfo.address.admin_area_2,
        shippingZone: shippingInfo.address.admin_area_1,
        shippingZip: shippingInfo.address.postal_code,
        shippingCountry: shippingInfo.address.country_code,
        paymentGateway: "paypal",
        paypalOrderId: data.id,
        payerId: buyerInfo.payer_id,
        payerEmail: buyerInfo.email_address,
        payerCountryCode: buyerInfo.address?.country_code ?? "N/A",
        status: "PAID",
        paymentId: undefined, // এখানে প্রথমে null, পরে ট্রানজেকশনে ভ্যালু সেট হবে
      },
    }),
  ]);

  // Order আপডেট করে Payment ID সেট করা
  const updatedOrder = await prisma.order.update({
    where: { id: savedOrder.id },
    data: { paymentId: newPayment.id },
  });

  // Attempt to create Pathao order after successful PayPal capture and order creation
  try {
    // IMPORTANT: recipient_city and recipient_zone need to be numerical IDs for Pathao.
    // The 'shippingZone' property is currently missing from your Order model.
    // You MUST add 'shippingZone' to your Prisma Order model and populate it during order creation.
    // Then, you will need to implement a mechanism to map the string values from updatedOrder
    // (e.g., updatedOrder.shippingCity, updatedOrder.shippingZone) to their corresponding
    // numerical IDs from Pathao's city and zone lists.
    // For example:
    const cityListResponse = await getCityListService();
    const cityList = cityListResponse.data;
    const recipientCityId = cityList.find((city) => city.city_name === updatedOrder.shippingCity)?.city_id;

    if (recipientCityId === undefined) {
      throw new Error(`City not found for ${updatedOrder.shippingCity}`);
    }

    const zoneList = await getZoneListService(recipientCityId);
    const recipientZoneId = zoneList.find((zone: Zone) => zone.zone_name === updatedOrder.shippingZone)?.zone_id;

    if (recipientZoneId === undefined) {
      throw new Error(`Zone not found for ${updatedOrder.shippingZone}`);
    }

    const pathaoPayload: ICreateOrderPayload = {
      store_id: 148058, // Assuming a fixed store ID for now, or retrieve dynamically
      merchant_order_id: updatedOrder.id, // Use the newly created order ID
      recipient_name: updatedOrder.shippingName,
      recipient_phone: updatedOrder.shippingPhone,
      recipient_address: updatedOrder.shippingStreet,
      recipient_city: updatedOrder.shippingCity as any, // Placeholder: Needs to be mapped to number ID
      recipient_zone: 0, // TEMPORARY PLACEHOLDER: This MUST be replaced with the actual numerical zone ID.
                         // See comments above regarding adding 'shippingZone' to your Order model.
      delivery_type: 48, // Assuming 'Normal Delivery' for now
      item_type: 2, // Assuming 'Parcel' for now
      item_quantity: 1, // Assuming 1 item per order for now
      item_weight: 0.5, // Minimum weight
      item_description: `Order #${updatedOrder.id} - ${updatedOrder.totalAmount} BDT`,
      special_instruction: `PayPal Order ID: ${updatedOrder.paypalOrderId}`,
      amount_to_collect: 0, // Assuming payment is already collected via PayPal
    };

    const pathaoOrder = await createOrderService(pathaoPayload);
    console.log("✅ Pathao order created successfully:", pathaoOrder);
  } catch (pathaoError: any) {
    console.error("❌ Failed to create Pathao order:", pathaoError.message);
  
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
