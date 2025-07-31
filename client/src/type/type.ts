export interface IUser{
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    isActive?: boolean;
    role: "ADMIN" | "user";
    iat?: number;
    exp?: number;
   
}



export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}

export enum PaymentMethod {
  ONLINE = "ONLINE",
  CASH = "CASH"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?:string,
  createdAt: string;
  updatedAt: string;
}



export interface Payment {
  id: string;
  userId: string;
  mediaId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentGatewayData?: any;
  createdAt: string;
  updatedAt: string;
  user?: User;
  
}


export type IProduct = {
  id: string;
  title: string;
  description?: string;
  price: number;
  weight?: number; // Optional field for product weight
  image: any; // Json type usually becomes `any`
 
};

export interface ICartItem {
  product: IProduct;
  quantity: number;
}


// type/type.ts
// for serach type

export interface IEstimatePayload {
  
  item_type: number; // 1 for Document, 2 for Parcel
  recipient_city: number;
  recipient_zone: number;
  delivery_type: number; // 48 for Normal, 12 for On Demand
  item_weight: number; // Min 0.5, Max 10
}


export interface ICreateOrderPayload {
  recipient_name: string;
  recipient_phone: string;
  recipient_city: number;        // ✅
  recipient_zone: number;        // ✅
  recipient_address: string;
  item_type: number;             // ✅
  item_quantity: number;         // ✅
  item_weight: number;           // ✅
  delivery_type: number;         // ✅
  amount_to_collect: number;     // ✅
  item_description: string;
  shipping_cost: number;         // ✅ (frontend-specific)
  paymentMethod: string;         // ✅ (frontend-specific)
  merchant_order_id?: string;    // ✅
  recipient_area?: number;       // ✅
  special_instruction?: string;  // ✅
}

