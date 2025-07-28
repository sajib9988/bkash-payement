"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { CheckoutFormValues } from "./checkout.type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

import { useEffect, useState } from "react";
import { estimateShipping, getCityList, createOrder } from "@/service/pathao/service";


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
    const fetchCities = async () => {
      try {
        const data = await getCityList();
        console.log("City List API response:", data);
        setDistricts(Array.isArray(data?.data) ? data.data.map((city: { name: string }) => city.name) : []);
      } catch (error) {
        toast.error("Failed to fetch cities.");
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (watchedDistrict) {
      const fetchShippingCost = async () => {
        try {
          const weight = cart.reduce(
            (acc, item) => acc + (item.product.weight || 0.5) * item.quantity,
            0
          );
          const zone = watchedDistrict === "Dhaka" ? "inside_dhaka" : "outside_dhaka";
          const payload = {
            city: watchedDistrict,
            item_type: "product",
            recipient_city: watchedDistrict,
            recipient_zone: zone,
            delivery_type: "regular",
            item_weight: String(weight),
            weight,
          };
          const data = await estimateShipping(payload);
          setShippingCost(data?.data?.cost?.rounded_based || 0);
        } catch (error) {
          toast.error("Failed to fetch shipping cost.");
        }
      };
      fetchShippingCost();
    }
  }, [watchedDistrict, cart]);

  const onSubmit = async (data: CheckoutFormValues) => {
    const zone = watchedDistrict === "Dhaka" ? "inside_dhaka" : "outside_dhaka";
    const checkoutData = {
      
      paymentMethod: "cash_on_delivery",
      delivery_type: "regular", // or whatever your API expects
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      total: getCartTotal() + shippingCost,
      recipient_name: data.name,
      recipient_phone: data.phone,
      recipient_email: data.email,
      recipient_address: data.address,
      recipient_city: data.district,
      recipient_zone: zone,
      shipping_cost: shippingCost,
      item_type: "product", // use first item's type or static value
      item_quantity: cart.reduce((acc, item) => acc + item.quantity, 0),
      item_weight: cart.reduce((acc, item) => acc + (item.product.weight || 0.5) * item.quantity, 0),
      amount_to_collect: getCartTotal() + shippingCost,
      item_description: cart.map(item => item.product.title).join(", "),
      // Add other required fields from ICreateOrderPayload as needed
    };

    try {
      const res = await createOrder(checkoutData);
      if (!res.success) {
        throw new Error(res.message || "Order creation failed");
      }
      toast.success("Order placed successfully with Cash on Delivery!");
      clearCart();
      router.push("/success"); // adjust this route as needed
    } catch (error) {
      toast.error("Failed to place order.");
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
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
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${getCartTotal().toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p>${shippingCost.toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold text-lg">
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
