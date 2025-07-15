import { Request, Response } from 'express';

import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';

import { authService } from './auth.service';



const logInUser =catchAsync(async (req: Request, res: Response) => {
  const result = await authService.logInUser(req.body, req);
  
  const { refreshToken } = result;

  res.cookie('refreshToken', refreshToken, {
      secure: false,
      httpOnly: true
  });


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user logged in successfully",
    data: result
  });
});


const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await authService.refreshToken(refreshToken);
  res.cookie('refreshToken', refreshToken, {
      secure: false,
      httpOnly: true
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "access token generate successfully",
    data: result
  });
});

const authController = {
  logInUser,
  refreshToken
};
export default authController;