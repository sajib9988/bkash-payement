"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

import * as z from "zod";
import { useShipping } from "./utils/useShipping";
import { checkoutSchema } from "./utils/CheckOutSchema";
import { handlePaypalPayment } from "./utils/paypalFlow";
import { createPathaoOrder } from "./utils/pathaoOrder";


type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const router = useRouter();

  const {
    districts,
    zones,
    shippingCost,
    setZones,
    fetchZones,
    fetchShippingCost,
  } = useShipping(cart);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const watchedDistrict = watch("district");
  const watchedZone = watch("zone");

  useEffect(() => {
    if (watchedDistrict) fetchZones(watchedDistrict);
  }, [watchedDistrict]);

  useEffect(() => {
    if (watchedDistrict && watchedZone) {
      const district = districts.find((d) => String(d.id) === watchedDistrict);
      const zone = zones.find((z) => String(z.id) === watchedZone);
      if (district && zone) fetchShippingCost(district.id, zone.id);
    }
  }, [watchedDistrict, watchedZone]);

const onSubmit = async (data: CheckoutFormValues) => {
  try {
    const selectedDistrict = districts.find((d) => String(d.id) === data.district);
    const selectedZone = zones.find((z) => String(z.id) === data.zone);
    if (!selectedDistrict || !selectedZone) throw new Error("Invalid district or zone");

    const total = getCartTotal() + shippingCost;

    await handlePaypalPayment(
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
            },
          },
        ],
      },
      data.email, // ✅ email
      cart        // ✅ cart items
    );

    await createPathaoOrder(data, cart, selectedDistrict, selectedZone, total, shippingCost);

    toast.success("Order placed successfully!");
    clearCart();
    router.push("/success");
  } catch (err: any) {
    toast.error(err.message || "Order failed");
  }
};


  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-semibold mb-1">
            Name
          </label>
          <input
            id="name"
            {...register("name")}
            className={`w-full border rounded px-3 py-2 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block font-semibold mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`w-full border rounded px-3 py-2 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block font-semibold mb-1">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            className={`w-full border rounded px-3 py-2 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block font-semibold mb-1">
            Address
          </label>
          <textarea
            id="address"
            {...register("address")}
            className={`w-full border rounded px-3 py-2 resize-none ${
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
            rows={3}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* District */}
        <div>
          <label htmlFor="district" className="block font-semibold mb-1">
            District
          </label>
          <select
            id="district"
            {...register("district")}
            className={`w-full border rounded px-3 py-2 ${
              errors.district ? "border-red-500" : "border-gray-300"
            }`}
            defaultValue=""
          >
            <option value="" disabled>
              Select district
            </option>
            {districts.map((district) => (
              <option key={district.id} value={String(district.id)}>
                {district.name}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>
          )}
        </div>

        {/* Zone */}
        <div>
          <label htmlFor="zone" className="block font-semibold mb-1">
            Zone
          </label>
          <select
            id="zone"
            {...register("zone")}
            className={`w-full border rounded px-3 py-2 ${
              errors.zone ? "border-red-500" : "border-gray-300"
            }`}
            defaultValue=""
            disabled={!zones.length}
          >
            <option value="" disabled>
              Select zone
            </option>
            {zones.map((zone) => (
              <option key={zone.id} value={String(zone.id)}>
                {zone.name}
              </option>
            ))}
          </select>
          {errors.zone && (
            <p className="text-red-500 text-sm mt-1">{errors.zone.message}</p>
          )}
        </div>

        {/* Shipping Cost (read-only) */}
        <div>
          <label className="block font-semibold mb-1">Shipping Cost</label>
          <input
            type="text"
            value={`৳${shippingCost.toFixed(2)}`}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Total Amount (read-only) */}
        <div>
          <label className="block font-semibold mb-1">Total</label>
          <input
            type="text"
            value={`৳${(getCartTotal() + shippingCost).toFixed(2)}`}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition"
        >
          Place Order
        </button>
      </form>

      {/* Order Summary Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="border p-4 rounded-md">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="flex justify-between mb-2"
            >
              <div>
                <p className="font-medium">{item.product.title}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <p>৳{(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <hr className="my-2" />
          <div className="flex justify-between">
            <p>Subtotal:</p>
            <p>৳{getCartTotal().toFixed(2)}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Estimated Shipping Cost:
            </label>
            <p className="mt-1 text-base font-semibold text-indigo-700">
              {shippingCost ? `৳${shippingCost.toFixed(2)}` : "Calculating..."}
            </p>
          </div>

          <div className="flex justify-between font-bold text-lg">
            <p>Total:</p>
            <p>৳{(getCartTotal() + shippingCost).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
