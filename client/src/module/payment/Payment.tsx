"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { IPaymentData } from "@/type/type";
import { createPayment } from "@/service/payement";

interface PaymentComponentProps {
  content: {
    id: string;
    title: string;
    amount: number;
    thumbnail: string;
    type: "MOVIE" | "SERIES";
  };
  user: {
    name: string;
    email: string;
    userId: string;
  };

}

export default function Payment({ content, user }: PaymentComponentProps) {
  const [loading, setLoading] = useState(false);



  const handleCreatePayment = async () => {
    setLoading(true);

    const paymentData: IPaymentData = {
      contentId: content.id,
      amount: content.amount,
      email: user.email,
      name: user.name,
      type: content.type,
      userId: user.userId,
      transactionId: "",
    };

    console.log("Payment Data to be sent:", paymentData);

    try {
      const result = await createPayment(paymentData);
      console.log("Payment API Response:", result);
     if (result?.data?.paymentUrl) {
  window.location.href = result.data.paymentUrl;
} else {
  alert("Payment initiation failed!");
}

    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col md:flex-row items-start gap-4 p-4">
      <div className="w-full md:w-1/2">
        <img
          src={content.thumbnail}
          alt={content.title}
          className="w-full h-auto rounded-md"
        />
      </div>

      <div className="w-full md:w-1/2">
        <CardHeader className="p-0 pb-2">
          <CardTitle>
            {content.type === "MOVIE" ? "Movie" : "Series"}: {content.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <p className="text-muted-foreground mb-4 text-sm">
            Price: ৳{content.amount}
          </p>
          <Button onClick={handleCreatePayment} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              `Pay Now ৳${content.amount}`
            )}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}