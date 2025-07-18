import { Request, Response } from 'express';
import { productService } from './product.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

export const addItem = catchAsync(async (req: Request, res: Response) => {
  const data = req.body; // Form data
  const files = req.files as Express.Multer.File[]; // Uploaded images

  const result = await productService.addProduct(data, files);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});


export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getAllProductsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products fetched successfully",
    data: result,
  });
});

export const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await productService.getSingleProductFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product fetched successfully",
    data: result,
  });
});

export const productController ={
    addItem,
    getAllProducts,
    getSingleProduct
}