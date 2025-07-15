



import {  Response } from "express";
import { IResponse } from "../type";



const sendResponse = async (res: Response, resPayload: IResponse) => {
    res
        .status(resPayload.statusCode)
        .json({
            success: resPayload.success,
            message: resPayload.message,
            data: resPayload?.data,
            meta: resPayload?.meta
        })
}

export default sendResponse;