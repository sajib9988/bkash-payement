"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { CheckoutFormValues } from "./checkout.type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

import { useEffect, useState } from "react";
import { createOrderService, estimateShippingService, getCityList, getZoneList } from "@/service/pathao/service";

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
  const [districts, setDistricts] = useState<any[]>([]); // ✅ full city object রাখুন
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const watchedDistrict = watch("district");

  // ✅ Cities fetch করার সময় error handling যোগ করুন
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        console.log('🔍 Starting to fetch cities...');
        
        const data = await getCityList();
        console.log('✅ City List API response:', data);
        
        if (data?.success && Array.isArray(data?.data)) {
          setDistricts(data.data); // ✅ full object রাখুন
          console.log('✅ Districts set:', data.data.length, 'cities');
        } else {
          console.error('❌ Invalid city data structure:', data);
          toast.error("Invalid city data received");
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch cities:', error);
        toast.error(`Failed to fetch cities: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCities();
  }, []);

  // ✅ Shipping cost calculation ঠিক করুন
  useEffect(() => {
    if (watchedDistrict && districts.length > 0) {
      const fetchShippingCost = async () => {
        try {
          // ✅ City name থেকে city_id খুঁজুন
          const selectedCity = districts.find(city => city.name === watchedDistrict);
          if (!selectedCity) {
            console.error('❌ City not found:', watchedDistrict);
            return;
          }

          const weight = cart.reduce(
            (acc, item) => acc + (item.product.weight || 0.5) * item.quantity,
            0
          );

          // ✅ Default zone_id নিন (প্রথম zone বা ডিফল্ট)
          const zoneList = await getZoneList(selectedCity.id);
          const defaultZone = zoneList?.data?.[0];
          
          if (!defaultZone) {
            console.error('❌ No zones found for city:', selectedCity.name);
            return;
          }

          const payload = {
            item_type: "2", // 2 = Parcel
            recipient_city: selectedCity.id.toString(),
            recipient_zone: defaultZone.id.toString(),
            delivery_type: "48", // 48 = Normal delivery
            item_weight: weight.toString(),
          };

          console.log('🔍 Shipping estimate payload:', payload);
          const data = await estimateShippingService(payload);
          console.log('✅ Shipping cost response:', data);
          
          setShippingCost(data?.data?.price || 0);
        } catch (error: any) {
          console.error('❌ Failed to fetch shipping cost:', error);
          toast.error(`Failed to fetch shipping cost: ${error.message}`);
        }
      };
      
      fetchShippingCost();
    }
  }, [watchedDistrict, cart, districts]);

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setLoading(true);
      
      // ✅ City এবং zone information সঠিকভাবে পান
      const selectedCity = districts.find(city => city.name === data.district);
      if (!selectedCity) {
        throw new Error('Selected city not found');
      }

      const zoneList = await getZoneList(selectedCity.id);
      const defaultZone = zoneList?.data?.[0];
      
      if (!defaultZone) {
        throw new Error('No zones found for selected city');
      }

      const checkoutData = {
        paymentMethod: "cash_on_delivery",
        delivery_type: 48, // ✅ Normal delivery
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        total: getCartTotal() + shippingCost,
        recipient_name: data.name,
        recipient_phone: data.phone,
        recipient_email: data.email,
        recipient_address: data.address,
        recipient_city: selectedCity.id, // ✅ number ID
        recipient_zone: defaultZone.id, // ✅ number ID
        shipping_cost: shippingCost,
        item_type: 2, // ✅ Parcel
        item_quantity: cart.reduce((acc, item) => acc + item.quantity, 0),
        item_weight: cart.reduce((acc, item) => acc + (item.product.weight || 0.5) * item.quantity, 0),
        amount_to_collect: getCartTotal() + shippingCost,
        item_description: cart.map(item => item.product.title).join(", "),
      };

      console.log('🔍 Final checkout data:', checkoutData);

      const res = await createOrderService(checkoutData);
      
      if (!res.success) {
        throw new Error(res.message || "Order creation failed");
      }
      
      toast.success("Order placed successfully with Cash on Delivery!");
      clearCart();
      router.push("/success");
      
    } catch (error: any) {
      console.error('❌ Order creation failed:', error);
      toast.error(`Failed to place order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {loading && (
        <div className="text-center py-4">
          <p>Loading...</p>
        </div>
      )}
      
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
                District ({districts.length} cities available)
              </label>
              <select
                id="district"
                {...register("district")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                disabled={loading}
              >
                <option value="">Select a district</option>
                {districts.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
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