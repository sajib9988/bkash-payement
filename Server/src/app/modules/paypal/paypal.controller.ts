import { Request, Response } from 'express';
import { createOrder, capturePayment, createInvoice, trackOrder, sendInvoice } from './paypal.service';

import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { CapturePaymentPayload, CreateInvoicePayload } from './paypal.interface';

export const createPaypalOrder = catchAsync(async (req: Request, res: Response) => {
  try {
    const {  ...orderBody } = req.body;
    const result = await createOrder(orderBody);

    res.status(200).json({
      success: true,
      message: 'Order created successfully!',
      data: result,
    });
  } catch (err: any) {

    res.status(500).json({
      success: false,
      message: "Something went wrong in PayPal order creation.",
      error: err.message,
    });
  }
});


export const capturePaypalPayment = catchAsync(async (req: Request, res: Response) => {
  const { paypalOrderId } = req.params; // PayPal Order ID
  const {  dbOrderId } = req.body as CapturePaymentPayload;

  if (!dbOrderId) {
    throw new Error('User ID, Shipping Phone and DB Order ID are required');
  }

  try {
    // capturePayment এখন PayPal order ID দিয়ে capture করবে
    // এবং শেষে DB update করবে dbOrderId ব্যবহার করে
    const result = await capturePayment(paypalOrderId, dbOrderId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'PayPal payment captured successfully',
      data: result,
    });
  } catch (err: any) {

    res.status(500).json({
      success: false,
      message: "Something went wrong in PayPal payment capture.",
      error: err.message,
    });
  }
});


export const createPaypalInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await createInvoice(req.body);


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PayPal invoice created successfully',
    data: result,
  });
});

export const trackPaypalOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await trackOrder(orderId);


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PayPal order tracked successfully',
    data: result,
  });
});


export const createAndSendInvoice = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as CreateInvoicePayload;
  const invoice = await createInvoice(payload);
  const sent = await sendInvoice(invoice.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invoice created and sent successfully!",
    data: sent,
  });
});