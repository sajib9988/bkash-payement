"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { createProduct } from "@/service/product"

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().min(1, "Price must be at least 1"),
  weight: z.number().min(0, "Weight must be a positive number").optional(),
  images: z.array(z.any()).optional()
})

type ProductFormValues = z.infer<typeof productSchema>

export default function ProductForm() {
  const router = useRouter()
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      weight: 0,
      images: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images"
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0];
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls[index] = URL.createObjectURL(file);
      setPreviewUrls(newPreviewUrls);

      const currentImages = form.getValues("images") || [];
      currentImages[index] = file;
      form.setValue("images", currentImages);
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const formData = new FormData()
      formData.append("data", JSON.stringify({
        title: data.title,
        description: data.description,
        price: data.price,
        weight: data.weight,
      }))

      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image)
          }
        })
      }

     const res= await createProduct(formData)
    console.log('res', res)
      toast.success("Product created successfully!")
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create product")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
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
                    <Input placeholder="Enter product title" {...field} />
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
                    <Textarea placeholder="Enter product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter product price"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>weight(kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter product weight"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Images */}
            <div>
              <FormLabel>Product Images</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-4 mt-2">
                  <FormField
                    control={form.control}
                    name={`images.${index}`}
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, index)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {previewUrls[index] && (
                    <img
                      src={previewUrls[index]}
                      alt={`preview-${index}`}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <Button type="button" variant="destructive" onClick={() => remove(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => append(null)}
              >
                Add Image
              </Button>
            </div>
            {/* Submit */}
            <Button type="submit" className="w-full">Create Product</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
