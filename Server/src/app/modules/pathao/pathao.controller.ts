import { Request, Response } from "express";


import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createOrderService, estimateShippingService, getAreaListService, getCityListService, getZoneListService, trackOrderService } from "./pathao.service";

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

// pathao.controller.ts (এর নিচে যুক্ত করো)

export const getCityList = catchAsync(async (req: Request, res: Response) => {
  const result = await getCityListService();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "City list fetched successfully",
    data: result,
  });
});


export const getZoneList = catchAsync(async (req: Request, res: Response) => {
  const city_id = parseInt(req.params.city_id, 10);
  const zones = await getZoneListService(city_id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Zones fetched",
    data: zones,
  });
});

export const getAreaList = catchAsync(async (req: Request, res: Response) => {
  const zone_id = parseInt(req.params.zone_id, 10);
  const areas = await getAreaListService(zone_id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Areas fetched",
    data: areas,
  });
});
