export interface IEstimatePayload {
  item_type: string; // Will be converted to number in service
  recipient_city: string; // Will be converted to number in service
  recipient_zone: string; // Will be converted to number in service
  delivery_type: string; // Will be converted to number in service
  item_weight: string; // Will be converted to number in service
}

export interface ICreateOrderPayload {
  store_id: number;
  merchant_order_id?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: number;
  recipient_zone: number;
  recipient_area?: number;
  delivery_type: number; // 48 for Normal, 12 for On Demand
  item_type: number; // 1 for Document, 2 for Parcel
  item_quantity: number;
  item_weight: number; // Min 0.5, Max 10
  item_description: string;
  special_instruction?: string;
  amount_to_collect: number; // 0 for non-COD
}