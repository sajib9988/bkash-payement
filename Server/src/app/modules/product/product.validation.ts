import { z } from 'zod';

export const productZodSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
  }),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => Number(val),
    z.number({ required_error: 'Price must be a number' })
  ),
  weight:z.number({
    required_error: 'Weight must be a number',}).optional()
});
