import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderService } from './order.service';


const createDraftOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.createDraftOrder(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Draft order created successfully!',
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { dbOrderId } = req.params;
  const result = await OrderService.getOrderById(dbOrderId);
  console.log('Order fetched by ID:', result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order fetched successfully!',
    data: result,
  });
});

export const OrderController = {
  createDraftOrder,
  getOrderById,

  getOrderByPaypalId: catchAsync(async (req: Request, res: Response) => {
    const { paypalOrderId } = req.params;
    const result = await OrderService.getOrderByPaypalId(paypalOrderId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order fetched successfully by PayPal order ID!',
      data: result,
    });
  }),
};
