"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { capturePayment } from "@/service/paypal"; // client-side call
import { getOrderByPaypalId } from "@/service/order/order.service";


const PaypalSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const paypalOrderId = searchParams.get("token");

    const confirm = async () => {
      if (!paypalOrderId) {
        toast.error("Invalid PayPal order ID.");
        router.push("/checkout");
        return;
      }

      try {
        const order = await getOrderByPaypalId(paypalOrderId);
        const dbOrderId = order.data.id;

        const result = await capturePayment(paypalOrderId, dbOrderId);
        

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
