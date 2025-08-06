import { Zilla_Slab } from "next/font/google";
import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
zip: z.string().min(4, "Zip code must be at least 4 characters"),

  district: z.string().min(1, "District is required"),
  zone: z.string().min(1, "Zone is required"),
});
