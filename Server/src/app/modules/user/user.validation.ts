import { z } from 'zod';

export const createUserSchema = z.object({

    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['USER', 'ADMIN']).optional(),
  })



export const updateUserSchema = z.object({
 
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
  })
