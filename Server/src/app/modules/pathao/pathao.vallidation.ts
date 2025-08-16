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
  recipient_name: z.string().min(3).max(100),
  recipient_phone: z.string().length(11), // strict 11 digits
  recipient_city: z.number(),
  recipient_zone: z.number(),
  recipient_area: z.number().optional(),
  recipient_address: z.string().min(10).max(220),
  item_type: z.number(),
  item_quantity: z.number().min(1),
  item_weight: z.union([z.string(), z.number()]), // Pathao expects string
  delivery_type:z.number(),
  amount_to_collect: z.number().min(0),
  item_description: z.string(),
  special_instruction: z.string().optional(),
  merchant_order_id: z.string().optional(),
});

