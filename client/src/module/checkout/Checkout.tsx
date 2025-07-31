"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

import {
  createOrderService,
  estimateShippingService,
  getCityList,
  getZoneList,
} from "@/service/pathao/service";

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  zone: z.string().min(1, "Zone is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const router = useRouter();

  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  const [zones, setZones] = useState<{ id: number; name: string }[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);

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

  // Fetch Districts on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      setLoading(true);
      try {
        const res = await getCityList();
        // Handle different response structures gracefully
        const cityData = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        const formattedDistricts = cityData.map((city: any) => ({
          id: city.city_id,
          name: city.city_name,
        }));
        setDistricts(formattedDistricts);
      } catch (err) {
        toast.error("Failed to load districts");
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  // Fetch Zones on district change
  useEffect(() => {
    if (!watchedDistrict) {
      setZones([]);
      return;
    }
    const fetchZones = async () => {
      try {
        const selectedDistrict = districts.find(
          (d) => String(d.id) === watchedDistrict
        );
        if (!selectedDistrict) return;

        const res = await getZoneList(selectedDistrict.id);
        const zoneData = res?.data ?? [];
        const formattedZones = zoneData.map((zone: any) => ({
          id: zone.zone_id,
          name: zone.zone_name,
        }));
        setZones(formattedZones);
      } catch (err) {
        toast.error("Failed to load zones");
      }
    };
    fetchZones();
  }, [watchedDistrict, districts]);

  // Fetch Shipping Cost on district or zone or cart change
  useEffect(() => {
    if (!watchedDistrict || !watchedZone) {
      setShippingCost(0);
      return;
    }
    const fetchShippingCost = async () => {
      try {
        const selectedDistrict = districts.find(
          (d) => String(d.id) === watchedDistrict
        );
        const selectedZone = zones.find(
          (z) => String(z.id) === watchedZone
        );
        if (!selectedDistrict || !selectedZone) return;

        const weight = cart.reduce(
          (acc, item) => acc + (item.product.weight || 0.5) * item.quantity,
          0
        );

        const payload = {
          item_type: 2,
          recipient_city: selectedDistrict.id,
          recipient_zone: selectedZone.id,
          delivery_type: 48,
          item_weight: weight,
        };

        const data = await estimateShippingService(payload);
        setShippingCost(data?.data?.price || 0);
      } catch {
        toast.error("Failed to fetch shipping cost");
      }
    };
    fetchShippingCost();
  }, [watchedDistrict, watchedZone, cart, districts, zones]);

  // Submit handler
  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setLoading(true);

      const selectedDistrict = districts.find(
        (d) => d.name === data.district || String(d.id) === data.district
      );
      const selectedZone = zones.find(
        (z) => z.name === data.zone || String(z.id) === data.zone
      );

      if (!selectedDistrict || !selectedZone) {
        throw new Error("Invalid district or zone selected");
      }

      const checkoutData = {
        paymentMethod: "cash_on_delivery",
        delivery_type: 48,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        total: getCartTotal() + shippingCost,
        recipient_name: data.name,
        recipient_phone: data.phone,
        recipient_email: data.email,
        recipient_address: data.address,
        recipient_city: selectedDistrict.id,
        recipient_zone: selectedZone.id,
        shipping_cost: shippingCost,
        item_type: 2,
        item_quantity: cart.reduce((acc, item) => acc + item.quantity, 0),
        item_weight: cart.reduce(
          (acc, item) => acc + (item.product.weight || 0.5) * item.quantity,
          0
        ),
        amount_to_collect: getCartTotal() + shippingCost,
        item_description: cart.map((item) => item.product.title).join(", "),
      };

      const res = await createOrderService(checkoutData);
      if (!res.success) throw new Error(res.message || "Order failed");

      toast.success("Order placed successfully!");
      clearCart();
      router.push("/success");
    } catch (err: any) {
      toast.error(err.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {loading && <p className="text-center text-gray-500">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Name</label>
            <input
              {...register("name")}
              type="text"
              className="mt-1 block w-full border rounded-md"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input
              {...register("email")}
              type="email"
              className="mt-1 block w-full border rounded-md"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Phone</label>
            <input
              {...register("phone")}
              type="tel"
              className="mt-1 block w-full border rounded-md"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Address</label>
            <textarea
              {...register("address")}
              rows={3}
              className="mt-1 block w-full border rounded-md"
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>

          {/* District Select */}
          <div className="mb-4">
            <label className="block text-sm font-medium">District</label>
            <select
              {...register("district")}
              className="mt-1 block w-full border rounded-md"
              disabled={loading}
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-red-500 text-sm">{errors.district.message}</p>
            )}
          </div>

          {/* Zone Select */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Zone</label>
            <select
              {...register("zone")}
              className="mt-1 block w-full border rounded-md"
              disabled={zones.length === 0}
            >
              <option value="">Select zone</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
            {errors.zone && (
              <p className="text-red-500 text-sm">{errors.zone.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <div>
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
                <p>${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between">
              <p>Subtotal:</p>
              <p>${getCartTotal().toFixed(2)}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Estimated Shipping Cost:
              </label>
              <p className="mt-1 text-base font-semibold text-indigo-700">
                {shippingCost ? `$${shippingCost.toFixed(2)}` : "Calculating..."}
              </p>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <p>Total:</p>
              <p>${(getCartTotal() + shippingCost).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
