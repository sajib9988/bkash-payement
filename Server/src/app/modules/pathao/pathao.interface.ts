export interface IEstimatePayload {
  store_id: number; // ✅ Added store_id which is required
  item_type: number;
  recipient_city: number;
  recipient_zone: number;
  delivery_type: number;
  item_weight: string;
}

export interface ICreateOrderPayload {
  store_id: number;
  merchant_order_id?: string;
  recipient_name: string; // 3-100 characters
  recipient_phone: string; // exactly 11 characters
  recipient_secondary_phone?: string; // exactly 11 characters (optional)
  recipient_address: string; // 10-220 characters
  recipient_city: number;
  recipient_zone: number;
  recipient_area?: number; // optional
  delivery_type: number; // 48 for Normal, 12 for On Demand
  item_type: number; // 1 for Document, 2 for Parcel
  special_instruction?: string;
  item_quantity: number;
  item_weight: number; // ✅ Changed to number (float)
  item_description?: string;
  amount_to_collect: number; // 0 for non-COD
}