import express from "express";
import Validator from "../../middleware/validator";

import { createOrderValidation, estimateValidation } from "./pathao.vallidation";
import { createOrder, estimateShippingCost, getAreaList, getCityList, getZoneList, trackOrder } from "./pathao.controller";


const router = express.Router();

router.post("/merchant/price-plan", Validator(estimateValidation), estimateShippingCost);
router.post("/orders", Validator(createOrderValidation), createOrder);
router.get("/orders", trackOrder);
// pathao.route.ts



router.get("/city-list", getCityList); // ✅ নতুন রাউট যুক্ত
router.get("/cities/:city_id/zone-list", getZoneList);
router.get("/zones/:zone_id/area-list", getAreaList);

export const PathaoShippingRoutes = router;
