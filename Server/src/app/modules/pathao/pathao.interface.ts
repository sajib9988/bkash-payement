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
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: number;
  recipient_zone: number;
  recipient_area?: number;
  delivery_type: number; // 48 for Normal, 12 for On Demand
  item_type: number; // 1 for Document, 2 for Parcel
  item_quantity: number;
  item_weight: string; // Min 0.5, Max 10
  item_description: string;
  special_instruction?: string;
  amount_to_collect: number; // 0 for non-COD
}