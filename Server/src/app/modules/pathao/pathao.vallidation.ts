
import { z } from "zod";

export const estimateValidation = z.object({

  body: z.object({
    item_type: z.number(), // Changed to number
    recipient_city: z.number(), // Changed to number
    recipient_zone: z.number(), // Changed to number
    delivery_type: z.number(), // Changed to number
    item_weight: z.number(), // Changed to number
  }),
});

export const createOrderValidation = z.object({
  body: z.object({
    store_id: z.number(),
    recipient_name: z.string(),
    recipient_phone: z.string(),
    recipient_city: z.number(),
    recipient_zone: z.number(),
    recipient_area: z.number().optional(),
    recipient_address: z.string(),
    item_type: z.number(),
    item_quantity: z.number(),
    item_weight: z.number(),
    delivery_type: z.number(),
    amount_to_collect: z.number(),
    item_description: z.string(),
    special_instruction: z.string().optional(),
    merchant_order_id: z.string().optional(),
  }),
});