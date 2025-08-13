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


import { useUser } from "@/context/userContext";
import { handlePaypalPayment } from "./utils/paypalFlow";
import { ICreateOrderPayload } from "@/type/type";
import { createOrderService } from "@/service/pathao/service";
import { createPathaoOrder } from "./utils/pathaoOrder";
import { createDraftOrderService } from "@/service/order/order.service";

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const router = useRouter();
   const { user } = useUser();
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

      if (!user?.userId) {
        toast.error("User not logged in.");
        return;
      }

      const draftOrderPayload = {
        shippingInfo: {
          name: data.name,
          phone: data.phone,
          address: data.address,
          district: selectedDistrict.name,
          zone: selectedZone.name,
          zip: data.zip,
        },
        cartInfo: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: total,
        userId: user.userId,
      };

      const draftOrder = await createDraftOrderService(draftOrderPayload);
      const orderId = draftOrder.orderId;

      
      const { approvalUrl, step } = await handlePaypalPayment({
        mode: "create",
        orderId: orderId,
        orderBody: {
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
        email: data.email,
        cart,
        userId: user.userId,
      });

      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        toast.error("Failed to start PayPal payment. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Order failed");
    }
  };

  useEffect(() => {
    const capturePaypalOrder = async () => {
      const params = new URLSearchParams(window.location.search);
      const paypalOrderId = params.get("token");
      const payerId = params.get("PayerID");

      if (paypalOrderId && payerId && user?.userId) {
        try {
          toast.loading("Completing PayPal payment...");
          const result = await handlePaypalPayment({
            mode: "capture",
            orderId: paypalOrderId,
            email: user.email, // Assuming user.email is available
            cart, // Pass cart for invoice creation
            userId: user.userId,
          });

          if (result?.step === "captured") {
            toast.dismiss();
            toast.success("Payment completed successfully!");

 const selectedDistrict = districts.find(d => String(d.id) === watchedDistrict);
  const selectedZone = zones.find(z => String(z.id) === watchedZone);

if (selectedDistrict && selectedZone) {
              if (selectedDistrict && selectedZone) {
              const orderPayload = {
                data: {
                  name: watch("name"),
                  phone: watch("phone"),
                  address: watch("address"),
                },
                selectedDistrict: selectedDistrict,
                selectedZone: selectedZone,
                cart: cart,
                total: getCartTotal() + shippingCost,
                shippingCost: shippingCost,
                userId: user.userId,
                paymentId: result.payment,
                paymentMethod: "PayPal",
              };

              try {
                const resss = await createPathaoOrder(orderPayload);
                console.log("Pathao order created successfully:", resss);

             
                toast.success("Pathao order created successfully!");
                clearCart();
                router.push("/checkout/success");
              } catch (err) {
                toast.error("Pathao order creation failed!");
                console.error(err);
              }
            } else {
              toast.error("District or Zone not selected");
            }
            } else {
              toast.error("Selected district or zone is not valid");
            }





            clearCart(); // Clear cart after successful payment
            router.push("/checkout/success"); // Redirect to success page
          } else {
            toast.dismiss();
            toast.error("Payment capture failed. Please try again.");
          }
        } catch (err: any) {
          toast.dismiss();
          console.error("PayPal capture error:", err);
          toast.error(err.message || "Failed to complete PayPal payment.");
        } finally {
          // Clean up URL parameters to prevent re-triggering on refresh
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("token");
          newUrl.searchParams.delete("PayerID");
          window.history.replaceState({}, document.title, newUrl.toString());
        }
      }
    };

    if (user?.userId) { // Ensure user is loaded before attempting capture
      capturePaypalOrder();
    }
  }, [router, cart, clearCart, user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your order below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Shipping Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="+880 1XXX XXXXXX"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <textarea
                  id="address"
                  {...register("address")}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                    errors.address ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  rows={3}
                  placeholder="House/Flat no., Street, Area"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              {/* Zip Code */}
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                  Zip / Postal Code
                </label>
                <input
                  id="zip"
                  type="text"
                  {...register("zip")}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.zip ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter postal code"
                />
                {errors.zip && (
                  <p className="text-red-500 text-sm mt-1">{errors.zip.message}</p>
                )}
              </div>

              {/* District and Zone - Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* District */}
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    id="district"
                    {...register("district")}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.district ? "border-red-500 bg-red-50" : "border-gray-300"
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
                  <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
                    Zone *
                  </label>
                  <select
                    id="zone"
                    {...register("zone")}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.zone ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    defaultValue=""
                    disabled={!zones.length}
                  >
                    <option value="" disabled>
                      {!zones.length ? "Select district first" : "Select zone"}
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
              </div>

              {/* Shipping Cost Display */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Shipping Cost:</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {shippingCost > 0 ? `৳${shippingCost.toFixed(2)}` : "Select location"}
                  </span>
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-800">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    ৳{(getCartTotal() + shippingCost).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={!cart.length || shippingCost === 0}
              >
                Place Order - ৳{(getCartTotal() + shippingCost).toFixed(2)}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Order Summary</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 line-clamp-2">
                          {item.product.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Qty: {item.quantity} × ৳{item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800 ml-4">
                        ৳{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-200" />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>৳{getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>
                      {shippingCost > 0 ? `৳${shippingCost.toFixed(2)}` : "TBD"}
                    </span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Final Total */}
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    ৳{(getCartTotal() + shippingCost).toFixed(2)}
                  </span>
                </div>

                {/* Security Badge */}
                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-sm text-green-700">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure checkout with PayPal
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;