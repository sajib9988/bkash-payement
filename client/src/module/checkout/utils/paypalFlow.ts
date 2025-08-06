import {
  capturePayment,
  createPaypalInvoice,
  createPaypalOrder,
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

export const handlePaypalPayment = async (
  orderBody: CreateOrderBody,
  email: string,
  cart: CartItem[],
  userId: string
) => {
  const order = await createPaypalOrder(orderBody);
  if (!order?.id) throw new Error("Failed to create PayPal order");
 console.log("Order created successfully paypal flow:", order);
  const payment = await capturePayment(order.id, userId as string);
  if (!payment?.status || payment.status !== "COMPLETED") {
    throw new Error("Payment failed or incomplete");
  }

  const createInvoice = await createPaypalInvoice({
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

  const sentInvoice = await sendPaypalInvoice(createInvoice.id);
  if (!sentInvoice) {
    throw new Error("Failed to send invoice");
  }

  return payment;
};
