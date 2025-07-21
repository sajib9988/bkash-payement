// src/modules/shipping/shipping.service.ts
import { ShippingParams } from "./shipping.interface";

export const getShippingCost = ({ zone, weightKg }: ShippingParams): number => {
  const baseCost = zone === "inside_dhaka" ? 60 : 150;
  const roundedWeight = Math.ceil(weightKg);
  const additionalWeight = Math.max(0, roundedWeight - 1);
  const weightCost = 20 + additionalWeight * 15;
  return baseCost + weightCost;
};
