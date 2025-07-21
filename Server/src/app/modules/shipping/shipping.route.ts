// src/modules/shipping/shipping.route.ts
import express from "express";
import auth from "../../middleware/auth";
import { getShippingCostController } from "./shipping.controller";
import { allDistricts } from "./shipping.constast";


const router = express.Router();

// GET /api/shipping-cost?zone=inside_dhaka&weight=1.5
router.get("/", auth("user"), getShippingCostController);

// Optional route to fetch districts list for UI dropdown
router.get("/districts", (req, res) => {
  res.json(allDistricts);
  console.log("Districts fetched:", allDistricts);
});

export const ShippingRoutes = router;
