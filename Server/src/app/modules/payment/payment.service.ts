import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../middleware/prisma';
import { createBkashPaymentRequest } from './bkash.service';

import { PaymentStatus } from '@prisma/client';
import { BkashCallbackPayload, BkashPaymentResponse } from '../../type';

export const createPayment = async (payload: any, userId: string) => {
  const { items, total, name, email, phone, address } = payload;

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount: total,
      status: PaymentStatus.PENDING,
      invoice: `INV-${uuidv4()}`,
      billingAddress: address,
      billingEmail: email,
      billingName: name,
      billingPhone: phone,
      paymentItems: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
  });

  return payment;
};

export const createBkashPayment = async (
  amount: string,
  userId: string,
  productId: string
): Promise<BkashPaymentResponse> => {
  const invoice = `INV-${uuidv4()}`;

  await prisma.payment.create({
    data: {
      invoice,
      amount: parseFloat(amount),
      status: PaymentStatus.PENDING,
      userId,
      productId,
    },
  });

  const bkashRes = await createBkashPaymentRequest(amount, invoice);
  return bkashRes;
};

export const handleBkashCallback = async (payload: BkashCallbackPayload) => {
  const { paymentID, status, trxID } = payload;

  const update = await prisma.payment.updateMany({
    where: {
      status: 'PENDING',
      transactionId: null,
    },
    data: {
      status: status || 'COMPLETED',
      transactionId: trxID || '',
    },
  });

  return { updated: update.count };
};