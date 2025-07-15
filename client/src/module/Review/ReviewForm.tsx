"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createReview } from "@/service/review";

const reviewSchema = z.object({
  comment: z.string().min(3, "রিভিউ অবশ্যই ৩ অক্ষরের বেশি হতে হবে"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ReviewForm({ mediaId }: { mediaId: string }) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comment: "",
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    try {
const res = await createReview({ mediaId, comment: data.comment });
console.log('res from review  from', res)
      if (!res.ok) throw new Error("Submit failed");
      toast.success("Review submitted successfully!");
      form.reset();
    } catch {
      toast.error("Failed to submit review.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-xl">
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your review..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Form>
  );
}
