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
  item_type: string;
  recipient_city: string;
  recipient_zone: string;
  delivery_type: string;
  item_weight: string;
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
