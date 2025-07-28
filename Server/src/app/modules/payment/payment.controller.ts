import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { createBkashPayment, handleBkashCallback } from './payment.service';
import sendResponse from '../../utils/sendResponse';
import { createPayment } from './payment.service';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: 'User not authenticated',
      });
    }

    // 🧾 Step 1: DB তে payment save করা
    const dbResult = await createPayment(req.body, req.user.id);

    // 💸 Step 2: bKash URL তৈরি করা
    const bkashResult = await createBkashPayment(
      String(dbResult.amount),     // বা req.body.total
      req.user.id,
      dbResult.id                  // অথবা dbResult.invoice
    );

    // ✅ Step 3: response পাঠানো
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Payment initiated successfully',
      data: bkashResult.bkashURL, // এটি ক্লায়েন্টে গিয়ে redirect হবে
    });

  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Failed to initiate payment',
      data: null,
    });
  }
};








export const initiateBkashPayment = async (req: Request, res: Response) => {
  const { amount, productId } = req.body;
  if (!req.user) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "User not authenticated",
    });
  }
  const data = await createBkashPayment(amount, req.user.id, productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiation successful",
    data: { url: data.bkashURL },
  });
};

export const bkashCallback = async (req: Request, res: Response) => {
  const result = await handleBkashCallback(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bkash callback handled successfully",
    data: result,
  });
};