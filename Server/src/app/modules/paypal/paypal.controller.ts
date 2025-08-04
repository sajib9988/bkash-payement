import { Request, Response } from 'express';
import { createOrder, capturePayment, createInvoice, trackOrder, sendInvoice } from './paypal.service';

import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { CreateInvoicePayload } from './paypal.interface';

export const createPaypalOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await createOrder(req.body);
  const data = await result.json();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PayPal order created successfully',
    data,
  });
});

export const capturePaypalPayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await capturePayment(orderId);
  const data = await result.json();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PayPal payment captured successfully',
    data,
  });
});

export const createPaypalInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await createInvoice(req.body);
  const data = await result.json();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PayPal invoice created successfully',
    data,
  });
});

export const trackPaypalOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await trackOrder(orderId);
  const data = await result.json();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PayPal order tracked successfully',
    data,
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
