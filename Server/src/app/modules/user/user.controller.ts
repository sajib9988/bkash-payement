import { Request, Response } from 'express';
import { userService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';


export const createUser = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user created successfully",
    data: user
});
};

const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "users retrieved successfully",
    data: users
})};


const getUserById = async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user retrieved successfully",
    data: user
  });
};

const updateUser = async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user updated successfully",
    data: user
});
};
const deleteUser = async (req: Request, res: Response) => {
  const user = await userService.deleteUser(req.params.id); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user deleted successfully",
    data: user
});
};

const findUserByEmail = async (req: Request, res: Response) => {
  const user = await userService.findUserByEmail(req.params.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user retrieved successfully",
    data: user
});
};





export const userController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  findUserByEmail
}