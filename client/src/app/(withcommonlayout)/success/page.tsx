"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PaymentSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    // Optional: you can validate payment again via IPN if needed
    console.log("Payment successful. Redirected from SSLCommerz.");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ Payment Successful!
      </h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. You can now enjoy your content.
      </p>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => router.push("/")}
      >
        Go to Home
      </button>
    </div>
  );
};

export default PaymentSuccess;
