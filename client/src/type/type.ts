export interface ICart {
    product: {
        id: string;
        title: string;
        price: number;
    };
    quantity: number;
}

export interface IPathaoCreateOrderPayload {
    recipient_name: string;
    recipient_phone: string;
    recipient_city: number;
    recipient_zone: number;
    recipient_address: string;
    item_type: number;
    item_quantity: number;
    item_weight: number;
    delivery_type: number;
    amount_to_collect: number;
    item_description: string;
    shipping_cost: number;
    paymentMethod: string;
    merchant_order_id: string;
    userId: string;
    paymentId: string;
}

export interface ICreateOrderPayload {
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    district: string;
    zone: string;
    zip?: string;
  };
  cartInfo: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  userId: string;
}

export interface ICreateOrderResponse {
  orderId: string;
}

export interface IEstimatePayload {
  store_id: number; // ✅ Added store_id which is required
  item_type: number;
  recipient_city: number;
  recipient_zone: number;
  delivery_type: number;
  item_weight: number;
}