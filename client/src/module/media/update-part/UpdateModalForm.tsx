"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Modal } from "./Modal";

// Validation Schema
const mediaSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  genre: z.string().min(1, "Genre is required"),
  type: z.enum(["MOVIE", "SERIES"]),
  videoUrls: z.array(z.string().url("Please enter a valid URL")),
  amount: z.number().min(50, "Amount must be at least 50"),
  thumbnail: z.any().optional(),
  releaseDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === "MOVIE") return data.videoUrls.length === 1;
    if (data.type === "SERIES") return data.videoUrls.length > 0;
    return true;
  },
  {
    message: "Movie requires exactly 1 URL, Series requires at least 1 URL",
    path: ["videoUrls"],
  }
);

type MediaFormValues = z.infer<typeof mediaSchema>;

interface Media {
  id: string;
  title: string;
  description: string;
  genre: string;
  type: "MOVIE" | "SERIES";
  videoUrls: string[];
  amount: number;
  thumbnail?: string | File;
  releaseDate?: string;
}

interface UpdateModalFormProps {
  open: boolean;
  onClose: () => void;
  media: Media | null;
  onSave: (updatedMedia: {
    id: string;
    title: string;
    description: string;
    genre: string;
    type: "MOVIE" | "SERIES";
    videoUrls: string[];
    amount: number;
    thumbnail?: string | File;
    releaseDate?: string;
  }) => Promise<void>;
  className?: string;
}

export function UpdateModalForm({ open, onClose, media, onSave }: UpdateModalFormProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const form = useForm<MediaFormValues>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      type: "MOVIE",
      videoUrls: [""],
      amount: 50,
      releaseDate: "",
    },
  });

  const mediaType = form.watch("type");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "videoUrls",
  });

  // Reset form when media changes
  useEffect(() => {
    if (!media) {
      console.log("No media provided");
      return;
    }

    const formattedReleaseDate = media.releaseDate
      ? new Date(media.releaseDate).toISOString().split("T")[0]
      : "";

    const mediaType = media.type && ["MOVIE", "SERIES"].includes(media.type) ? media.type : "MOVIE";

    form.reset({
      title: media.title || "",
      description: media.description || "",
      genre: media.genre || "",
      type: mediaType,
      videoUrls: media.videoUrls?.length ? media.videoUrls : [""],
      amount: media.amount || 50,
      releaseDate: formattedReleaseDate,
    });

    form.setValue("type", mediaType);

    console.log("Form Values After Reset:", form.getValues());

    if (media.thumbnail) {
      setThumbnailPreview(
        typeof media.thumbnail === "string" ? media.thumbnail : URL.createObjectURL(media.thumbnail)
      );
    } else {
      setThumbnailPreview(null);
    }
  }, [media, form]);

  // Handle media type change
  useEffect(() => {
    if (mediaType === "MOVIE" && fields.length > 1) {
      for (let i = fields.length - 1; i >= 1; i--) {
        remove(i);
      }
    }
  }, [mediaType, fields.length, remove]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailFile(null);
      setThumbnailPreview(
        media?.thumbnail && typeof media.thumbnail === "string" ? media.thumbnail : null
      );
    }
  };

  const onSubmit = async (data: MediaFormValues) => {
    if (!media?.id) return;

    try {
      await onSave({
        ...data,
        id: media.id,
        thumbnail: thumbnailFile || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update media:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Media">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="text-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-200 font-medium text-sm">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter title"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-200 font-medium text-sm">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        className="min-h-[80px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Thumbnail Upload */}
              <FormItem className="space-y-1.5">
                <FormLabel className="text-gray-300 text-xs font-semibold">Thumbnail</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="bg-gray-800 border-gray-700 text-gray-100 h-9 px-3 text-sm flex items-center file:mr-3 file:h-7 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 transition-all duration-200"
                    />
                    {thumbnailPreview && (
                      <div className="flex justify-center mb-4">
                        <div className="border border-gray-700 rounded-md overflow-hidden shadow-lg">
                          <img
                            src={thumbnailPreview}
                            alt="Preview"
                            className="w-full max-w-48 h-auto object-cover rounded-md"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Genre and Type */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-gray-200 font-medium text-sm">Genre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Action, Drama"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-gray-200 font-medium text-sm">Type</FormLabel>
                      <FormControl>
                        <Input
                          value={media?.type === "MOVIE" ? "Movie" : media?.type === "SERIES" ? "Series" : "Movie"}
                          className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition-all cursor-not-allowed"
                          readOnly
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Amount and Release Date */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-gray-200 font-medium text-sm">Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition-all"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="releaseDate"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-gray-200 font-medium text-sm">Release Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Video URLs Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-gray-200 font-medium text-sm">Video URLs</FormLabel>
                  {mediaType === "SERIES" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-all p-2 text-xs"
                      onClick={() => append("")}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Episode
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-700 pr-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`videoUrls.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-1">
                            <FormControl>
                              <Input
                                placeholder={
                                  mediaType === "MOVIE"
                                    ? "Main video URL"
                                    : `Episode ${index + 1} URL`
                                }
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition-all"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                      {mediaType === "SERIES" && fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {form.formState.errors.videoUrls?.message && (
                  <p className="text-xs font-medium text-red-400">
                    {form.formState.errors.videoUrls?.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 transition-all p-3 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 text-white hover:bg-green-600 transition-all p-3 text-sm"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}