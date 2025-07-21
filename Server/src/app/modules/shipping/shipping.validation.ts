// src/modules/shipping/shipping.validation.ts
import { z } from "zod";
import { allDistricts } from "./shipping.constast";


export const createShippingValidation = z.object({
  body: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    district: z.string().refine(val => allDistricts.includes(val), {
      message: "Invalid district name",
    }),
  }),
});
