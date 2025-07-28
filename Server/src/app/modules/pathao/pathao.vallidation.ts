import { z } from "zod";

export const estimateValidation = z.object({
  body: z.object({
    item_type: z.string(),
    recipient_city: z.string(),
    recipient_zone: z.string(),
    delivery_type: z.string(),
  }),
});

export const createOrderValidation = z.object({
  body: z.object({
    store_id: z.string(),
    recipient_name: z.string(),
    recipient_phone: z.string(),
    recipient_city: z.string(),
    recipient_zone: z.string(),
    recipient_address: z.string(),
    item_type: z.string(),
    item_quantity: z.string(),
    item_weight: z.string(),
    delivery_type: z.string(),
    amount_to_collect: z.string(),
    item_description: z.string(),
    special_instruction: z.string().optional(),
    packaging_required: z.string().optional(),
    actual_product_price: z.string().optional(),
  }),
});
