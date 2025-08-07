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

interface PaypalFlowProps {
  mode: Mode;
  orderBody?: CreateOrderBody; // Only required in "create"
  orderId?: string; // Only required in "capture"
  email: string;
  cart: CartItem[];
  userId: string;
}

export const handlePaypalPayment = async ({
  mode,
  orderBody,
  orderId,
  email,
  cart,
  userId,
}: PaypalFlowProps) => {
  if (mode === "create") {
    // ✅ Step 1: Create PayPal Order
    if (!orderBody) throw new Error("Missing order body for creation");
    const order = await createPaypalOrder(orderBody);
    console.log("🧾 PayPal Order Response:", order);
    if (!order?.id) throw new Error("Failed to create PayPal order");

    // ✅ Step 2: Get approval URL


    const approvalLink = order?.links?.find((l: any) => l.rel === "approve");

if (!approvalLink?.href) throw new Error("Approval link not found");
console.log("createPaypalOrder approvalLink", approvalLink);
    return {
      orderId: order.id,
      approvalUrl: approvalLink.href,
      step: "approval",
    };
  }

  if (mode === "capture") {
    // ✅ Step 3: Capture Payment
    if (!orderId) throw new Error("Missing orderId for capture");
    const payment = await capturePayment(orderId, userId);
    if (!payment?.status || payment.status !== "COMPLETED") {
      throw new Error("Payment capture failed");
    }

    // ✅ Step 4: Create and Send Invoice
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
