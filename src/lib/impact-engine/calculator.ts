/**
 * Impact Calculator - Core Calculation Engine
 * Scientific formulas for environmental impact calculations
 */

import { ImpactInput, ImpactOutput, CalculationResult } from "./types";
import {
  validateTransportDistance,
  validateElectricityUnits,
  validateWaterLitres,
  validatePlasticWeight,
  validateWaterDuration,
  ValidationException,
} from "./validators";

/**
 * Scientific Conversion Factors
 * Based on peer-reviewed research and official standards
 */
const IMPACT_FORMULAS = {
  TRANSPORT_KM: {
    // Average car emission: 0.21 kg CO2/km (EPA standard)
    co2_kg: 0.21,
    // Average car efficiency: ~150 Wh/km
    electricity_wh: 150,
    // Water usage in fuel production: 0.5 L/km
    water_litre: 0.5,
    // Particulate matter and other waste: 0.01 kg/km
    waste_kg: 0.01,
  },
  ELECTRICITY_KWH: {
    // Grid average: 0.82 kg CO2/kWh (global average)
    co2_kg: 0.82,
    // 1 kWh = 1000 Wh
    electricity_wh: 1000,
    // Water for thermal power plants: 0.27 L/kWh
    water_litre: 0.27,
    // Waste from power generation: 0.001 kg/kWh
    waste_kg: 0.001,
  },
  WATER_LITRE: {
    // Water treatment and distribution: 0.0002 kg CO2/L
    co2_kg: 0.0002,
    // Pumping and treatment: 3 Wh/L
    electricity_wh: 3,
    // 1L water saved = 1L
    water_litre: 1,
    // No direct waste from water conservation
    waste_kg: 0,
  },
  PLASTIC_KG: {
    // Plastic production emissions: 5.9 kg CO2/kg plastic
    co2_kg: 5.9,
    // Plastic production energy: 20 kWh/kg
    electricity_wh: 20000,
    // Water for plastic production: 300 L/kg
    water_litre: 300,
    // 1kg plastic prevented = 1kg waste saved
    waste_kg: 1,
  },
  WATER_ACTIVITY_MINUTE: {
    // Shower/water activity: 0.00001 kg CO2/min (heating)
    co2_kg: 0.00001,
    // Water heating: 0.5 kWh per 5-min shower = 0.1 kWh/min
    electricity_wh: 100,
    // Average shower: 15 L/min
    water_litre: 15,
    // No direct waste
    waste_kg: 0,
  },
  CYCLING_KM: {
    // No emissions (human powered)
    co2_kg: 0.21, // Avoided car emissions
    electricity_wh: 150,
    water_litre: 0.5,
    waste_kg: 0.01,
  },
  RUNNING_KM: {
    // No emissions (human powered)
    co2_kg: 0.21, // Avoided car emissions
    electricity_wh: 150,
    water_litre: 0.5,
    waste_kg: 0.01,
  },
  WALKING_KM: {
    // No emissions (human powered)
    co2_kg: 0.21, // Avoided car emissions
    electricity_wh: 150,
    water_litre: 0.5,
    waste_kg: 0.01,
  },
};

/**
 * Calculate transport-based impact (cycling, walking, running, etc.)
 */
export function calculateTransportImpact(distance_km: number): ImpactOutput {
  const error = validateTransportDistance(distance_km);
  if (error) {
    throw new ValidationException([error]);
  }

  const factors = IMPACT_FORMULAS.TRANSPORT_KM;
  return {
    co2_kg_saved: parseFloat((distance_km * factors.co2_kg).toFixed(2)),
    electricity_wh_saved: parseFloat((distance_km * factors.electricity_wh).toFixed(1)),
    water_litre_saved: parseFloat((distance_km * factors.water_litre).toFixed(1)),
    waste_kg_prevented: parseFloat((distance_km * factors.waste_kg).toFixed(3)),
  };
}

/**
 * Calculate electricity-based impact (bill reduction)
 */
export function calculateElectricityImpact(units_saved: number): ImpactOutput {
  const error = validateElectricityUnits(units_saved);
  if (error) {
    throw new ValidationException([error]);
  }

  const factors = IMPACT_FORMULAS.ELECTRICITY_KWH;
  return {
    co2_kg_saved: parseFloat((units_saved * factors.co2_kg).toFixed(2)),
    electricity_wh_saved: parseFloat((units_saved * factors.electricity_wh).toFixed(0)),
    water_litre_saved: parseFloat((units_saved * factors.water_litre).toFixed(1)),
    waste_kg_prevented: parseFloat((units_saved * factors.waste_kg).toFixed(3)),
  };
}

/**
 * Calculate water-based impact (litres saved through activity)
 */
export function calculateWaterImpact(litres_saved: number): ImpactOutput {
  const error = validateWaterLitres(litres_saved);
  if (error) {
    throw new ValidationException([error]);
  }

  const factors = IMPACT_FORMULAS.WATER_LITRE;
  return {
    co2_kg_saved: parseFloat((litres_saved * factors.co2_kg).toFixed(2)),
    electricity_wh_saved: parseFloat((litres_saved * factors.electricity_wh).toFixed(0)),
    water_litre_saved: parseFloat((litres_saved * factors.water_litre).toFixed(1)),
    waste_kg_prevented: parseFloat((litres_saved * factors.waste_kg).toFixed(3)),
  };
}

/**
 * Calculate plastic-based impact (weight of plastic prevented/collected)
 */
export function calculatePlasticImpact(weight_kg: number): ImpactOutput {
  const error = validatePlasticWeight(weight_kg);
  if (error) {
    throw new ValidationException([error]);
  }

  const factors = IMPACT_FORMULAS.PLASTIC_KG;
  return {
    co2_kg_saved: parseFloat((weight_kg * factors.co2_kg).toFixed(2)),
    electricity_wh_saved: parseFloat((weight_kg * factors.electricity_wh).toFixed(0)),
    water_litre_saved: parseFloat((weight_kg * factors.water_litre).toFixed(1)),
    waste_kg_prevented: parseFloat((weight_kg * factors.waste_kg).toFixed(3)),
  };
}

/**
 * Calculate water activity impact (shower/bath duration)
 */
export function calculateWaterActivityImpact(
  duration_minutes: number
): ImpactOutput {
  const error = validateWaterDuration(duration_minutes);
  if (error) {
    throw new ValidationException([error]);
  }

  const factors = IMPACT_FORMULAS.WATER_ACTIVITY_MINUTE;
  return {
    co2_kg_saved: parseFloat((duration_minutes * factors.co2_kg).toFixed(2)),
    electricity_wh_saved: parseFloat((duration_minutes * factors.electricity_wh).toFixed(0)),
    water_litre_saved: parseFloat((duration_minutes * factors.water_litre).toFixed(1)),
    waste_kg_prevented: parseFloat((duration_minutes * factors.waste_kg).toFixed(3)),
  };
}

/**
 * Main impact calculation dispatcher
 */
export function calculateImpact(input: ImpactInput): CalculationResult {
  let output: ImpactOutput;
  let formula = "";

  try {
    switch (input.type.toUpperCase()) {
      case "TRANSPORT_KM":
      case "CYCLING_KM":
      case "RUNNING_KM":
      case "WALKING_KM":
        output = calculateTransportImpact(input.value);
        formula = `${input.value} km × transport carbon factors`;
        break;

      case "ELECTRICITY_KWH":
      case "ELECTRICITY_UNITS":
        output = calculateElectricityImpact(input.value);
        formula = `${input.value} kWh × grid CO2 (0.82 kg/kWh)`;
        break;

      case "WATER_LITRE":
        output = calculateWaterImpact(input.value);
        formula = `${input.value} L × water treatment factors`;
        break;

      case "WATER_ACTIVITY":
      case "WATER_DURATION":
        output = calculateWaterActivityImpact(input.value);
        formula = `${input.value} minutes × shower consumption`;
        break;

      case "PLASTIC_KG":
        output = calculatePlasticImpact(input.value);
        formula = `${input.value} kg × plastic production factors`;
        break;

      default:
        throw new Error(`Unknown impact type: ${input.type}`);
    }

    return {
      input,
      output,
      formula,
      calculatedAt: new Date().toISOString(),
      isValid: true,
    };
  } catch (error) {
    if (error instanceof ValidationException) {
      throw error;
    }
    throw new Error(`Calculation failed for ${input.type}: ${error}`);
  }
}

/**
 * Batch calculate multiple impacts
 */
export function calculateBatchImpact(inputs: ImpactInput[]): CalculationResult[] {
  return inputs.map((input) => calculateImpact(input));
}

/**
 * Aggregate multiple impact calculations
 */
export function aggregateImpacts(results: CalculationResult[]): ImpactOutput {
  return results.reduce(
    (total, result) => ({
      co2_kg_saved: total.co2_kg_saved + result.output.co2_kg_saved,
      electricity_wh_saved: total.electricity_wh_saved + result.output.electricity_wh_saved,
      water_litre_saved: total.water_litre_saved + result.output.water_litre_saved,
      waste_kg_prevented: total.waste_kg_prevented + result.output.waste_kg_prevented,
    }),
    {
      co2_kg_saved: 0,
      electricity_wh_saved: 0,
      water_litre_saved: 0,
      waste_kg_prevented: 0,
    }
  );
}
