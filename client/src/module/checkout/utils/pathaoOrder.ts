import { ICreateOrderPayload } from "@/type/type"; // অবশ্যই সঠিক পাথ ব্যবহার করো
import { createOrderService } from "@/service/pathao/service";
import { calculateWeight, calculateTotalQuantity, getItemDescription } from "./calculateShipping";

export const createPathaoOrder = async (
  data: any,
  cart: any[],
  selectedDistrict: any,
  selectedZone: any,
  total: number,
  shippingCost: number
) => {
  const payload: ICreateOrderPayload = {
    recipient_name: data.name,
    recipient_phone: data.phone,
    recipient_city: selectedDistrict.id,
    recipient_zone: selectedZone.id,
    recipient_address: data.address,
    item_type: 2,
    item_quantity: calculateTotalQuantity(cart),
    item_weight: calculateWeight(cart),
    delivery_type: 48,
    amount_to_collect: total,       // এটা তুমি total পাস করছো তাই use করো
    item_description: getItemDescription(cart),
    shipping_cost: shippingCost,
    paymentMethod: "cash_on_delivery",  // fixed value or dynamic ও দিতে পারো
    merchant_order_id: undefined,   // প্রয়োজনমতো দিতে পারো
    recipient_area: undefined,      // প্রয়োজনমতো দিতে পারো
    special_instruction: undefined, // প্রয়োজনমতো দিতে পারো
  };

  const order = await createOrderService(payload);
  if (!order?.success) throw new Error("Pathao order failed");
  return order;
};
