import { Request, Response } from "express";


import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createOrderService, estimateShippingService, trackOrderService } from "./pathao.service";

export const estimateShippingCost = catchAsync(async (req: Request, res: Response) => {
  const result = await estimateShippingService(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shipping cost estimated successfully",
    data: result,
  });
});

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await createOrderService(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

export const trackOrder = catchAsync(async (req: Request, res: Response) => {
  const { tracking_number } = req.params;
  const result = await trackOrderService(tracking_number);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order tracked successfully",
    data: result,
  });
});
