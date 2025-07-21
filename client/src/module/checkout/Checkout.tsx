"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { CheckoutFormValues } from "./checkout.type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createPayment } from "@/service/payement";
import { getDistricts, getShippingCost } from "@/service/shippingService";
import { useEffect, useState } from "react";

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
});

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const [districts, setDistricts] = useState<string[]>([]);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const watchedDistrict = watch("district");

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await getDistricts();
        console.log("API response for districts:", data);
        setDistricts(data);
      } catch (error) {
        toast.error("Failed to fetch districts.");
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (watchedDistrict) {
      const fetchShippingCost = async () => {
        try {
          const zone = watchedDistrict === "Dhaka" ? "inside_dhaka" : "outside_dhaka";
          const weight = cart.reduce((acc, item) => acc + (item.product.weight || 0.5) * item.quantity, 0);
          const data = await getShippingCost(zone, weight);
          setShippingCost(data.cost.rounded_based);
        } catch (error) {
          toast.error("Failed to fetch shipping cost.");
        }
      };
      fetchShippingCost();
    }
  }, [watchedDistrict, cart]);

  const onSubmit = async (data: CheckoutFormValues) => {
    const checkoutData = {
      ...data,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      total: getCartTotal() + shippingCost,
    };

    try {
      const result = await createPayment(checkoutData);

      const bkashURL = result?.data;
      console.log("Bkash URL:", result);

      if (bkashURL) {
        toast.success("Redirecting to bKash...");
        clearCart();
        window.location.href = bkashURL;
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
            {/* Form fields */}
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
            <div className="mb-4">
              <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                District
              </label>
              <select
                id="district"
                {...register("district")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a district</option>
       
                {(Array.isArray(districts) ? districts : []).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
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
              <div className="flex justify-between items-center">
                <p>Subtotal</p>
                <p>${getCartTotal().toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Shipping</p>
                <p>${shippingCost.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center font-bold text-lg">
                <p>Total</p>
                <p>${(getCartTotal() + shippingCost).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
