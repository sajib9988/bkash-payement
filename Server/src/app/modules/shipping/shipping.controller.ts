// src/modules/shipping/shipping.controller.ts
import { Request, Response } from "express";
import { getShippingCost } from "./shipping.service";

export const getShippingCostController = (req: Request, res: Response): void => {
  const zone = req.query.zone as "inside_dhaka" | "outside_dhaka";
  const weight = parseFloat(req.query.weight as string);

  if (!zone || isNaN(weight)) {
    res.status(400).json({ message: "Invalid zone or weight" });
    return;
  }

  const roundedCost = getShippingCost({ zone, weightKg: weight });

  res.status(200).json({
    zone,
    weight,
    cost: {
      rounded_based: roundedCost,
    },
  });
};
