"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { CheckoutFormValues } from "./checkout.type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createPayment } from "@/service/payement";

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
});

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormValues) => {
  const checkoutData = {
    ...data,
    items: cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    })),
    total: getCartTotal(),
  };

  try {
    const response = await createPayment(checkoutData);

    if (response?.bkashURL) {
      toast.success("Redirecting to bKash...");
      clearCart();
      window.location.href = response.bkashURL; // ✅ bKash page-এ redirect করবে
    } else {
      toast.error("Failed to initiate payment: No bKash URL received.");
    }
  } catch (error) {
    toast.error("Failed to initiate payment.");
  }
};

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Billing Information</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                {...register("phone")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                {...register("address")}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Place Order
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <div className="border rounded-md p-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">{item.product.title}</h3>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <p>Total</p>
                <p>${getCartTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
