import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createDraftOrder(payload: any) {
  const { shippingInfo, cartInfo, totalAmount, userId, paypalOrderId } = payload;

  return prisma.order.create({
    data: {
      userId,
      totalAmount,
      status: "PENDING",
      paypalOrderId,
      shippingName: shippingInfo.name,
      shippingPhone: shippingInfo.phone,
      shippingStreet: shippingInfo.address,
      shippingCity: shippingInfo.district,
      shippingZone: shippingInfo.zone,
      shippingZip: shippingInfo.zip,
      pathaoRecipientCityId: shippingInfo.pathaoRecipientCityId,
      pathaoRecipientZoneId: shippingInfo.pathaoRecipientZoneId,
      orderItems: {
        create: cartInfo.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { orderItems: true },
  });
}

export async function getOrderById(dbOrderId: string) {
  const result = await prisma.order.findUnique({
    where: { id: dbOrderId },
    include: { orderItems: true },
  });
  if (!result) throw new Error("Order not found");
  return result;
}

const getOrderByPaypalId = async (paypalOrderId: string) => {
  console.log('Searching for order with PayPal ID:', paypalOrderId);
  
  const result = await prisma.order.findFirst({
    where: {
      paypalOrderId: paypalOrderId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      user: true,
      payment: true,
    },
  });

  if (!result) {
    throw new Error(`Order not found with PayPal ID: ${paypalOrderId}`);
  }

  console.log('Order found:', result);
  return result;
};

export const OrderService = {
  createDraftOrder,
  getOrderById,
  getOrderByPaypalId,
};