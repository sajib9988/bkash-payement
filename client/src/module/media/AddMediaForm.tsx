"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { createMedia } from "@/service/media"

// Schema
const mediaSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  genre: z.string().min(1, "Genre is required"),
  type: z.enum(["MOVIE", "SERIES"]),
  videoUrls: z.array(z.string().url("Please enter a valid URL")),
  amount: z.number().min(50, "Amount must be at least 50"),
  thumbnail: z.instanceof(File).optional()
}).refine((data) => {
  if (data.type === "MOVIE") return data.videoUrls.length === 1
  if (data.type === "SERIES") return data.videoUrls.length > 1
  return false
}, {
  message: "MOVIE এর জন্য ১টি URL, এবং SERIES এর জন্য একাধিক URL দিতে হবে।",
  path: ["videoUrls"]
})

type MediaFormValues = z.infer<typeof mediaSchema>

export default function AddMediaForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const form = useForm<MediaFormValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      type: "MOVIE",
      videoUrls: [""],  // start with one input
      amount: 0
    }
  })

  const mediaType = form.watch("type")

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "videoUrls"
  })

  // Adjust videoUrls inputs based on media type
  useEffect(() => {
    if (mediaType === "MOVIE" && fields.length > 1) {
      // Remove all except first input for MOVIE
      for (let i = fields.length - 1; i >= 1; i--) {
        remove(i)
      }
    } else if ((mediaType === "MOVIE" || mediaType === "SERIES") && fields.length === 0) {
      // Ensure at least one input is present
      append("")
    }
  }, [mediaType, fields.length, append, remove])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("thumbnail", file)
      const reader = new FileReader()
      reader.onloadend = () => setThumbnailPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: MediaFormValues) => {
    try {
      setIsSubmitting(true)

      const formData = new FormData()
      const body = {
        title: data.title,
        description: data.description,
        genre: data.genre,
        type: data.type,
        amount: data.amount,
        videoUrls: data.videoUrls
      }

      if (data.thumbnail) {
        formData.append("thumbnail", data.thumbnail)
      }

      formData.append("data", JSON.stringify(body))

      await createMedia(formData)
      toast.success("Media created successfully!")
      form.reset()
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create media")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter media title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter media description" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Genre & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter genre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MOVIE">Movie</SelectItem>
                      <SelectItem value="SERIES">Series</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {mediaType === "MOVIE"
                      ? "Movies require exactly one video URL"
                      : "Series require multiple video URLs (one per episode)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Thumbnail */}
            <FormField
              control={form.control}
              name="thumbnail"
              render={() => (
                <FormItem>
                  <FormLabel>Thumbnail</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input type="file" accept="image/*" onChange={handleThumbnailChange} />
                      {thumbnailPreview && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-40 h-auto object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Upload a thumbnail image for the media</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Video URLs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Video URLs</FormLabel>
                {mediaType === "SERIES" && (
                  <Button type="button" variant="outline" size="sm" onClick={() => append("")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Episode
                  </Button>
                )}
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`videoUrls.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder={mediaType === "MOVIE" ? "Enter video URL" : `Episode ${index + 1} URL`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {mediaType === "SERIES" && fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {form.formState.errors.videoUrls?.message && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.videoUrls?.message}
                </p>
              )}
            </div>
            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Media"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
 