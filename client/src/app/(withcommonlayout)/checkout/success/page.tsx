"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { capturePayment } from "@/service/paypal"; // client-side call

const PaypalSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const orderId = searchParams.get("token");
    const userId = localStorage.getItem("userId"); // or get from context
const shippingPhone = localStorage.getItem("shippingPhone") ?? "";


    if (!orderId || !userId) return;

    const confirm = async () => {
      try {
        const result = await capturePayment(orderId, userId, shippingPhone);
        console.log("✅ Payment Done:", result);

        toast.success("Payment successful!");
        router.push("/thank-you"); // ✅ Redirect after payment
      } catch (err: any) {
        console.error(err);
        toast.error("Payment failed. Try again.");
      }
    };

    confirm();
  }, []);

  return (
    <div className="text-center mt-20">
      <h1 className="text-xl font-semibold">Confirming your payment...</h1>
    </div>
  );
};

export default PaypalSuccessPage;
