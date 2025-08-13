import { prisma } from "../../middleware/prisma";
import { CreateOrderBody } from "./paypal.interface";
import { createOrderService, getCityListService, getZoneListService } from "../pathao/pathao.service";
import { ICreateOrderPayload } from "../pathao/pathao.interface";
import { City, Zone } from "../pathao/pathao.type";
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

  // 1️⃣ PayPal থেকে Payment Capture
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

  // 2️⃣ প্রয়োজনীয় ডাটা এক্সট্রাক্ট
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
    // Payment create
    const payment = await tx.payment.create({
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
    });

    // Draft order খুঁজে বের করা
    let order = await tx.order.findFirst({
      where: { userId, status: { in: ['DRAFT', 'PENDING'] } }
    });

    if (order) {
      order = await tx.order.update({
        where: { id: order.id },
        data: {
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
          paymentId: payment.id
        }
      });
    } else {
      order = null; // Draft না থাকলে নতুন order হবে না
    }

    return [payment, order];
  });

  console.log("✅ New Payment created:", newPayment);
  console.log("✅ Order updated:", updatedOrder);

  // 4️⃣ Pathao order create চেষ্টা করবে (Order থাকলেই)
  if (updatedOrder) {
    try {
      const cityListResponse = await getCityListService();
      const cityList: City[] = cityListResponse.data.data;
      console.log("City List from server:", cityList);

      const recipientCityId = cityList.find(
        (city: City) =>
          city.city_name.trim().toLowerCase() === updatedOrder.shippingCity.trim().toLowerCase()
      )?.city_id;

      if (!recipientCityId) {
        throw new Error(`City not found for ${updatedOrder.shippingCity}`);
      }

      const zoneListObject = await getZoneListService(recipientCityId);
      const zoneList: Zone[] = zoneListObject.data.data;
      const recipientZoneId = zoneList.find(
        (zone: Zone) =>
          zone.zone_name.trim().toLowerCase() === updatedOrder.shippingZone!.trim().toLowerCase()
      )?.zone_id;

      if (!recipientZoneId) {
        throw new Error(`Zone not found for ${updatedOrder.shippingZone}`);
      }

      const pathaoPayload: ICreateOrderPayload = {
        store_id: 148058,
        merchant_order_id: updatedOrder.id,
        recipient_name: updatedOrder.shippingName,
        recipient_phone: updatedOrder.shippingPhone,
        recipient_address: updatedOrder.shippingStreet,
        recipient_city: recipientCityId,
        recipient_zone: recipientZoneId,
        delivery_type: 48,
        item_type: 2,
        item_quantity: 1,
        item_weight: 0.5,
        item_description: `Order #${updatedOrder.id} - ${updatedOrder.totalAmount} BDT`,
        special_instruction: `PayPal Order ID: ${updatedOrder.paypalOrderId}`,
        amount_to_collect: 0,
      };

      const pathaoOrder = await createOrderService(pathaoPayload);
      console.log("✅ Pathao order created successfully:", pathaoOrder);
    } catch (pathaoError: any) {
      console.error("❌ Failed to create Pathao order:", pathaoError.message);
    }
  }

  return updatedOrder || newPayment;
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
