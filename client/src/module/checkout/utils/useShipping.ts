"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { calculateWeight } from "./calculateShipping";
import {
  estimateShippingService,
  getCityList,
  getZoneList,
} from "@/service/pathao/service";

interface City {
  id: number;
  name: string;
}

interface Zone {
  id: number;
  name: string;
}

export const useShipping = (cart: any[]) => {
  const [districts, setDistricts] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [shippingCost, setShippingCost] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCityList();
        const cities = Array.isArray(res?.data) ? res.data : res || [];
        setDistricts(
          cities.map((c: any) => ({
            id: c.city_id,
            name: c.city_name,
          }))
        );
      } catch {
        toast.error("Failed to load districts");
      }
    })();
  }, []);

  const fetchZones = async (districtId: string | number) => {
    try {
      const res = await getZoneList(districtId as number);
      const zones = res?.data || [];
      setZones(
        zones.map((z: any) => ({
          id: z.zone_id,
          name: z.zone_name,
        }))
      );
    } catch {
      toast.error("Failed to load zones");
    }
  };

  const fetchShippingCost = async (districtId: number, zoneId: number) => {
    try {
      const weight = calculateWeight(cart);
      const cost = await estimateShippingService({
        item_type: 2,
        recipient_city: districtId,
        recipient_zone: zoneId,
        delivery_type: 48,
        item_weight: weight,
      });
      setShippingCost(cost || 0);
    } catch {
      toast.error("Failed to fetch shipping cost");
    }
  };

  return {
    districts,
    zones,
    shippingCost,
    setZones,
    fetchZones,
    fetchShippingCost,
  };
};
