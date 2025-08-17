// pathao.validation.ts
import { isNumberObject } from "util/types";
import { z } from "zod";

export const estimateValidation = z.object({
  
    item_type: z.number(),
    recipient_city: z.number(),
    recipient_zone: z.number(),
    delivery_type: z.number(),
    item_weight: z.number(),
  })





export const createOrderValidation = z.object({
  store_id: z.number().positive(),
  merchant_order_id: z.string().optional(),
  recipient_name: z.string().min(3).max(100),
  recipient_phone: z.string().length(11).regex(/^[0-9]+$/, "Phone must contain only digits"),
  recipient_secondary_phone: z.string().length(11).regex(/^[0-9]+$/, "Phone must contain only digits").optional(),
  recipient_address: z.string().min(10).max(220),
  recipient_city: z.number().positive(),
  recipient_zone: z.number().positive(),
  recipient_area: z.number().positive().optional(),
  delivery_type: z.number().refine(val => [12, 48].includes(val), "delivery_type must be 12 or 48"),
  item_type: z.number().refine(val => [1, 2].includes(val), "item_type must be 1 or 2"),
  special_instruction: z.string().optional(),
  item_quantity: z.number().min(1),
  item_weight: z.number().min(0.5).max(10), // ✅ Float between 0.5-10
  item_description: z.string().optional(),
  amount_to_collect: z.number().min(0),
});

