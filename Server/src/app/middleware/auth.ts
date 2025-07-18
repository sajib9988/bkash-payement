import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { jwtHelpers } from "../helper/jwt.helper";
import config from "../config";
import ApiError from "../errors/apiError";
import { role } from "../modules/auth/auth.interface";



const auth = (...roles:  role[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization

            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!")
            }
 
            const verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as string)

            req.user = verifiedUser;
 
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!")
            }
            next()
        }
        catch (err) {
            next(err)
        }
    }
};

export default auth;