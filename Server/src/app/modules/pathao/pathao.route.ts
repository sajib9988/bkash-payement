import express from "express";
import Validator from "../../middleware/validator";

import { createOrderValidation, estimateValidation } from "./pathao.vallidation";
import { createOrder, estimateShippingCost, getAreaList, getCityList, getZoneList, trackOrder } from "./pathao.controller";


const router = express.Router();

router.post("/estimate", Validator(estimateValidation), estimateShippingCost);
router.post("/order", Validator(createOrderValidation), createOrder);
router.get("/track/:tracking_number", trackOrder);
// pathao.route.ts



router.get("/cities", getCityList); // ✅ নতুন রাউট যুক্ত
router.get("/cities/:city_id/zones", getZoneList);
router.get("/zones/:zone_id/areas", getAreaList);

export const PathaoShippingRoutes = router;
