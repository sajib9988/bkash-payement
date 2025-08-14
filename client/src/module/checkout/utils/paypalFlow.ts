import {
  createPaypalOrder,
  capturePayment,
  createPaypalInvoice,
  sendPaypalInvoice,
} from "@/service/paypal";
import { CreateOrderBody } from "@/service/paypal/type";

interface CartItem {
  product: {
    title: string;
    price: number;
  };
  quantity: number;
}

type Mode = "create" | "capture";

export interface PaypalFlowProps {
  mode: "create" | "capture";
  dbOrderId?: string; // ✅ draftOrderId = dbOrderId
  orderBody?: any;
  email: string;
  cart: any[];
  userId: string;
  shippingPhone?: string;
  paypalOrderId?: string;
}


export const handlePaypalPayment = async ({
  mode,
  orderBody,
  paypalOrderId,
  dbOrderId,
  email,
  cart,
  userId,
  shippingPhone,
}: PaypalFlowProps) => {
  if (mode === "create") {
    if (!orderBody) throw new Error("Missing order body for creation");

    const order = await createPaypalOrder(orderBody);
    console.log("🧾 PayPal Order Response:", order);
    if (!order?.id) throw new Error("Failed to create PayPal order");

    const approvalLink = order?.links?.find((l: any) => l.rel === "approve");
    if (!approvalLink?.href) throw new Error("Approval link not found");

    return {
      paypalOrderId: order.id,
      approvalUrl: approvalLink.href,
      step: "approval",
    };
  }

  if (mode === "capture") {
    if (!paypalOrderId) throw new Error("Missing PayPal orderId for capture");
    if (!dbOrderId) throw new Error("Missing DB orderId for capture");

    // ✅ Pass both PayPal orderId and DB orderId to capturePayment
    const payment = await capturePayment(paypalOrderId, dbOrderId);

    if (!payment?.status || payment.status !== "COMPLETED") {
      throw new Error("Payment capture failed");
    }

    // Create and send invoice
    const invoice = await createPaypalInvoice({
      detail: {
        invoice_number: `INV-${Date.now()}`,
        currency_code: "USD",
        note: "Thanks for your purchase!",
        terms_and_conditions: "No refunds after 30 days.",
      },
      invoicer: {
        name: {
          given_name: "Seller",
          surname: "Name",
        },
        email_address: "seller@example.com",
      },
      primary_recipients: [
        {
          billing_info: {
            name: {
              given_name: "Customer",
              surname: "Name",
            },
            email_address: email,
          },
        },
      ],
      items: cart.map((item) => ({
        name: item.product.title,
        quantity: String(item.quantity),
        unit_amount: {
          currency_code: "USD",
          value: item.product.price.toFixed(2),
        },
      })),
    });

    const sentInvoice = await sendPaypalInvoice(invoice.id);
    if (!sentInvoice) {
      throw new Error("Failed to send invoice");
    }

    return {
      payment,
      invoiceId: invoice.id,
      sentInvoice,
      step: "captured",
    };
  }

  throw new Error("Invalid PayPal flow mode");
};
