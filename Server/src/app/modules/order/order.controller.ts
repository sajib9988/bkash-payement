import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderService } from './order.service';

const createDraftOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.createDraftOrder(req.body);
  console.log('Draft order created CONTROLLER:', result);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Draft order created successfully!',
    data: result,
  });
});

export const OrderController = {
  createDraftOrder,
};
