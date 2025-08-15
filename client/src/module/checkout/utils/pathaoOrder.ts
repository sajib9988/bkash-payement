import { IPathaoCreateOrderPayload, ICart } from "@/type/type"; 
import { createOrderService } from "@/service/pathao/service";
import { calculateWeight, calculateTotalQuantity, getItemDescription } from "./calculateShipping";


interface IPathaoOrderProps {
  data: {
    name: string;
    phone: string;
    address: string;
  };
  selectedDistrict: { id: number };
  selectedZone: { id: number };
  cart: ICart[];
  total: number;
  shippingCost: number;
  userId: string;
  paymentId?: string; // ✅ Optional করুন
  paymentMethod: string;
}

export const createPathaoOrder = async ({
  data,
  selectedDistrict,
  selectedZone,
  cart,
  total,
  shippingCost,
  userId,
  paymentId,
  paymentMethod,
}: IPathaoOrderProps) => {
  const payload:  IPathaoCreateOrderPayload = {
    recipient_name: data.name,
    recipient_phone: data.phone,
    recipient_city: selectedDistrict.id,
    recipient_zone: selectedZone.id,
    recipient_address: data.address,
    item_type: 2, 
    item_quantity: calculateTotalQuantity(cart),
    item_weight: calculateWeight(cart),
    delivery_type: 48, 
    amount_to_collect: total,
    item_description: getItemDescription(cart),
    shipping_cost: shippingCost,
    paymentMethod: paymentMethod,
    merchant_order_id: crypto.randomUUID(), 
    userId: userId,
    paymentId: paymentId!,
  };

  const order = await createOrderService(payload);
  if (!order?.success) throw new Error("Pathao order failed");
  return order.data.consignment_id;
};