// app/(auth)/register/RegisterForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, RegistrationSchemaType } from "./registerValidation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { registerUser, getCurrentUser } from "@/service/AuthService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/userContext";

export default function RegisterForm() {
  const router = useRouter();
  const { setUser } = useUser();

  const form = useForm<RegistrationSchemaType>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");

  const onSubmit = async (data: RegistrationSchemaType) => {
    try {
      const res = await registerUser(data);

      if (res?.success) {
        toast.success(res.message);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        router.push("/");
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch (error: any) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl max-w-md w-full p-6 mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || password !== passwordConfirm}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 underline">
          Login
        </Link>
      </p>
    </div>
  );
}
