export type IProduct = {
  id: string;
  title: string;
  description?: string;
  price: number;
  image: any; // Json type usually becomes `any`
  createdAt: Date;
  updatedAt: Date;
};
