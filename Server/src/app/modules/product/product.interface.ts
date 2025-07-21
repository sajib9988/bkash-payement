export type IProduct = {
  id: string;
  title: string;
  description?: string;
  price: number;
  weight?: number; // Optional field for product weight
  image: any; // Json type usually becomes `any`
  createdAt: Date;
  updatedAt: Date;
};
