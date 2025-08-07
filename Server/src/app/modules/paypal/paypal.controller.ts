import { Request, Response } from 'express';
import { createOrder, capturePayment, createInvoice, trackOrder, sendInvoice } from './paypal.service';

import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { CapturePaymentPayload, CreateInvoicePayload } from './paypal.interface';

export const createPaypalOrder = catchAsync(async (req: Request, res: Response) => {
  try {
    console.log("✅ /order route hit");
    console.log("📦 Payload received:\n", JSON.stringify(req.body, null, 2));

    const result = await createOrder(req.body);

    res.status(200).json({
      success: true,
      message: 'Order created successfully!',
      data: result,
    });
  } catch (err: any) {
    console.error("❌ Error inside createPaypalOrder:", err.message);
    console.error(err); // Full stack trace

    res.status(500).json({
      success: false,
      message: "Something went wrong in PayPal order creation.",
      error: err.message,
    });
  }
});



export const capturePaypalPayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { userId, shippingPhone } = req.body as CapturePaymentPayload;

  if (!userId || !shippingPhone) {
    throw new Error('User ID and Shipping Phone are required');
  }

  const result = await capturePayment(orderId, userId, shippingPhone);


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PayPal payment captured successfully',
    data:result,
  });
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