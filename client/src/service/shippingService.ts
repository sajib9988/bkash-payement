export const getDistricts = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/shipping/districts`);
  return response.json();
};

export const getShippingCost = async (zone: string, weight: number) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/shipping?zone=${zone}&weight=${weight}`
  );
  return response.json();
};
