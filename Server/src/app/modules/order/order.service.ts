import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createDraftOrder = async (payload: any) => {
  // console.log("Payload received in createDraftOrder:", payload);
  const { shippingInfo, cartInfo, totalAmount, userId } = payload;

  const result = await prisma.order.create({
    data: {
      userId: userId,
      totalAmount: totalAmount,
      status: 'PENDING', // Using PENDING as DRAFT was not migrated
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
    include: {
      orderItems: true,
    },
  });
console.log('Draft order created:', result);
  return result;
};

export const OrderService = {
  createDraftOrder,
};
