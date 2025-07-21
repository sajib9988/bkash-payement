// src/modules/shipping/shipping.interface.ts
export interface IShippingInfo {
  quantity: number;
  weightKg: number;
  address: string;
  district: string;
}

export type ShippingZone = 'inside_dhaka' | 'outside_dhaka';

export interface ShippingParams {
  zone: ShippingZone;
  weightKg: number;
}
