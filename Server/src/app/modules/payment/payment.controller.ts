import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { createBkashPayment, handleBkashCallback } from './payment.service';
import sendResponse from '../../utils/sendResponse';
import { createPayment } from './payment.service';

export const initiatePayment = async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
    });
  }
  const result = await createPayment(req.body, req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment created successfully',
    data: result,
  });
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