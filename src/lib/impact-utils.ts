<<<<<<< HEAD
import { calculateImpact, ImpactInput } from "./impact-engine";
import { ImpactOutput } from "./impact-engine/types";

=======
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
export const CO2_PER_POINT = 0.05;
export const ELECTRICITY_PER_POINT = 1.5;
export const WATER_PER_POINT = 2.0;
export const WASTE_PER_POINT = 0.03;

export const calculateCO2 = (points: number): number =>
  parseFloat((points * CO2_PER_POINT).toFixed(2));

export const calculateElectricity = (points: number): number =>
  parseFloat((points * ELECTRICITY_PER_POINT).toFixed(1));

export const calculateWater = (points: number): number =>
  parseFloat((points * WATER_PER_POINT).toFixed(1));

export const calculateWaste = (points: number): number =>
  parseFloat((points * WASTE_PER_POINT).toFixed(2));

export const formatCO2 = (kg: number): string => `${kg.toFixed(2)} kg`;

export const formatElectricity = (wh: number): string =>
  wh >= 1000 ? `${(wh / 1000).toFixed(2)} kWh` : `${wh.toFixed(1)} Wh`;

export const formatWater = (litres: number): string =>
  litres >= 1000 ? `${(litres / 1000).toFixed(2)} kL` : `${litres.toFixed(1)} L`;

export const formatWaste = (kg: number): string => `${kg.toFixed(2)} kg`;
<<<<<<< HEAD

/**
 * NEW FUNCTIONS - Activity-based impact calculations using scientific engine
 */

export function calculateActivityBasedImpact(input: ImpactInput): ImpactOutput {
  const result = calculateImpact(input);
  return result.output;
}

export function calculateTransportImpactSaved(distance_km: number): ImpactOutput {
  return calculateActivityBasedImpact({
    type: "TRANSPORT_KM",
    value: distance_km,
    unit: "km",
  });
}

export function calculateElectricityImpactSaved(electricity_kWh: number): ImpactOutput {
  return calculateActivityBasedImpact({
    type: "ELECTRICITY_KWH",
    value: electricity_kWh,
    unit: "kWh",
  });
}

export function calculateWaterImpactSaved(water_litres: number): ImpactOutput {
  return calculateActivityBasedImpact({
    type: "WATER_LITRE",
    value: water_litres,
    unit: "L",
  });
}

export function calculatePlasticImpactPrevented(plastic_weight_kg: number): ImpactOutput {
  return calculateActivityBasedImpact({
    type: "PLASTIC_KG",
    value: plastic_weight_kg,
    unit: "kg",
  });
}

export function calculateWaterActivityImpact(duration_minutes: number): ImpactOutput {
  return calculateActivityBasedImpact({
    type: "WATER_ACTIVITY",
    value: duration_minutes,
    unit: "min",
  });
}

export function migratePointsToActivityImpact(points: number): ImpactOutput {
  return {
    co2_kg_saved: calculateCO2(points),
    electricity_wh_saved: calculateElectricity(points),
    water_litre_saved: calculateWater(points),
    waste_kg_prevented: calculateWaste(points),
  };
}

export function aggregateImpacts(impacts: ImpactOutput[]): ImpactOutput {
  return impacts.reduce(
    (total, impact) => ({
      co2_kg_saved: total.co2_kg_saved + impact.co2_kg_saved,
      electricity_wh_saved: total.electricity_wh_saved + impact.electricity_wh_saved,
      water_litre_saved: total.water_litre_saved + impact.water_litre_saved,
      waste_kg_prevented: total.waste_kg_prevented + impact.waste_kg_prevented,
    }),
    {
      co2_kg_saved: 0,
      electricity_wh_saved: 0,
      water_litre_saved: 0,
      waste_kg_prevented: 0,
    }
  );
}
=======
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
