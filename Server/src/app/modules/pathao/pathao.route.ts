import express from "express";
import Validator from "../../middleware/validator";

import { createOrderValidation, estimateValidation } from "./pathao.vallidation";
import { createOrder, estimateShippingCost, trackOrder } from "./pathao.controller";


const router = express.Router();

router.post("/estimate", Validator(estimateValidation), estimateShippingCost);
router.post("/order", Validator(createOrderValidation), createOrder);
router.get("/track/:tracking_number", trackOrder);

export const PathaoShippingRoutes = router;
