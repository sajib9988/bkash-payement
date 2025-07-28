export interface IEstimatePayload {
  item_type: string;
  recipient_city: string;
  recipient_zone: string;
  delivery_type: string;
}

export interface ICreateOrderPayload {
  store_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_city: string;
  recipient_zone: string;
  recipient_address: string;
  item_type: string;
  item_quantity: string;
  item_weight: string;
  delivery_type: string;
  amount_to_collect: string;
  item_description: string;
  special_instruction?: string;
  packaging_required?: string;
  actual_product_price?: string;
}

export interface ITrackOrderParam {
  tracking_number: string;
}
