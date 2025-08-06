export const calculateWeight = (cart: any[]) => {
  return cart.reduce((acc, item) => acc + (item.product.weight || 0.5) * item.quantity, 0);
};

export const calculateTotalQuantity = (cart: any[]) => {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
};

export const getItemDescription = (cart: any[]) => {
  return cart.map((item) => item.product.title).join(", ");
};
