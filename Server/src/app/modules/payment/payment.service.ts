import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../middleware/prisma';
import { createBkashPaymentRequest } from './bkash.service';

import { PaymentStatus } from '@prisma/client';
import { BkashCallbackPayload, BkashPaymentResponse } from '../../type';

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
