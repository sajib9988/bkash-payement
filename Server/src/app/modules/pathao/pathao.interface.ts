export interface IEstimatePayload {
  item_type: string;
  recipient_city: string;
  recipient_zone: string;
  delivery_type: string;
}

// Backend-এর জন্য সঠিক payload
export interface ICreateOrderPayload {
  store_id: number;
  merchant_order_id?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: number;
  recipient_zone: number;
  recipient_area?: number;
  delivery_type: number;
  item_type: number;
  item_quantity: number;
  item_weight: number;
  item_description: string;
  special_instruction?: string;
  amount_to_collect: number;
}

export interface ITrackOrderParam {
  tracking_number: string;
}
