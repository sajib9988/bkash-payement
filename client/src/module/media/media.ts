import { z } from "zod"

// Schema for creating media
export const backendmediaZodSchema = z
  .object({
    title: z.string().min(1).max(100),
    description: z.string().min(10),
    genre: z.string().min(1),
    type: z.enum(["MOVIE", "SERIES"]),
    videoUrls: z.array(z.string().url()),
    amount: z.number(),
  })
  .refine(
    (data) => {
      if (data.type === "MOVIE") return data.videoUrls.length === 1
      if (data.type === "SERIES") return data.videoUrls.length > 1
      return false
    },
    {
      message: "MOVIE এর জন্য ১টি URL, এবং SERIES এর জন্য একাধিক URL দিতে হবে।",
      path: ["videoUrls"],
    },
  )

// Schema for updating media
export const mediaUpdateSchema = z
  .object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(10).optional(),
    genre: z.string().min(1).optional(),
    type: z.enum(["MOVIE", "SERIES"]).optional(),
    amount: z.number().optional(),
    // Optional videoUrls or videoUrl
    videoUrls: z.array(z.string().url()).optional(),
    videoUrl: z.string().url().optional(),
    thumbnail: z.string().optional(),
  })
  .refine(
    (data) => {
      // Ensure that if videoUrls is provided, videoUrl is not provided, and vice versa
      if (data.videoUrls && data.videoUrl) {
        return false
      }
      return true
    },
    {
      message: "You can only provide either videoUrl or videoUrls, not both.",
      path: ["videoUrl", "videoUrls"],
    },
  )

export type IMedia = {
  id?: string
  title: string
  description: string
  genre: string
  thumbnail: string
  videoUrls: string[]
  type: "MOVIE" | "SERIES"
  amount?: number | null
  releaseDate?: Date
  createdAt?: Date
}
