/**
 * Input Validators for Impact Engine
 * Ensures data integrity before calculations
 */

import { ValidationError } from "./types";

export class ValidationException extends Error {
  constructor(public errors: ValidationError[]) {
    super(`Validation failed: ${errors.map((e) => e.reason).join("; ")}`);
  }
}

/**
 * Transport Distance Validation
 * Realistic bounds: 0.1 km (100m walk) to 100 km (long journey)
 */
export function validateTransportDistance(distance: number): ValidationError | null {
  if (typeof distance !== "number" || isNaN(distance)) {
    return {
      field: "distance",
      value: distance,
      reason: "Distance must be a valid number",
    };
  }
  if (distance < 0.1) {
    return {
      field: "distance",
      value: distance,
      minValue: 0.1,
      reason: "Distance must be at least 0.1 km",
    };
  }
  if (distance > 100) {
    return {
      field: "distance",
      value: distance,
      maxValue: 100,
      reason: "Distance must be less than 100 km",
    };
  }
  return null;
}

/**
 * Electricity Units Validation
 * Realistic bounds: 0 to 1000 units per month
 */
export function validateElectricityUnits(units: number): ValidationError | null {
  if (typeof units !== "number" || isNaN(units)) {
    return {
      field: "electricity_units",
      value: units,
      reason: "Electricity units must be a valid number",
    };
  }
  if (units < 0) {
    return {
      field: "electricity_units",
      value: units,
      minValue: 0,
      reason: "Electricity units cannot be negative",
    };
  }
  if (units > 1000) {
    return {
      field: "electricity_units",
      value: units,
      maxValue: 1000,
      reason: "Electricity units must be less than 1000 per month",
    };
  }
  return null;
}

/**
 * Water Litres Validation
 * Realistic bounds: 15 L (short shower) to 300 L (bath)
 */
export function validateWaterLitres(litres: number): ValidationError | null {
  if (typeof litres !== "number" || isNaN(litres)) {
    return {
      field: "water_litres",
      value: litres,
      reason: "Water litres must be a valid number",
    };
  }
  if (litres < 15) {
    return {
      field: "water_litres",
      value: litres,
      minValue: 15,
      reason: "Water usage must be at least 15 L",
    };
  }
  if (litres > 300) {
    return {
      field: "water_litres",
      value: litres,
      maxValue: 300,
      reason: "Water usage must be less than 300 L",
    };
  }
  return null;
}

/**
 * Plastic Weight Validation
 * Realistic bounds: 0.01 kg (10g bottle) to 10 kg (large collection)
 */
export function validatePlasticWeight(weight: number): ValidationError | null {
  if (typeof weight !== "number" || isNaN(weight)) {
    return {
      field: "plastic_weight",
      value: weight,
      reason: "Plastic weight must be a valid number",
    };
  }
  if (weight < 0.01) {
    return {
      field: "plastic_weight",
      value: weight,
      minValue: 0.01,
      reason: "Plastic weight must be at least 0.01 kg (10g)",
    };
  }
  if (weight > 10) {
    return {
      field: "plastic_weight",
      value: weight,
      maxValue: 10,
      reason: "Plastic weight must be less than 10 kg",
    };
  }
  return null;
}

/**
 * Water Duration Validation (for shower/bath calculations)
 * Realistic bounds: 1 minute to 60 minutes
 */
export function validateWaterDuration(minutes: number): ValidationError | null {
  if (typeof minutes !== "number" || isNaN(minutes)) {
    return {
      field: "water_duration",
      value: minutes,
      reason: "Duration must be a valid number",
    };
  }
  if (minutes < 1) {
    return {
      field: "water_duration",
      value: minutes,
      minValue: 1,
      reason: "Duration must be at least 1 minute",
    };
  }
  if (minutes > 60) {
    return {
      field: "water_duration",
      value: minutes,
      maxValue: 60,
      reason: "Duration must be less than 60 minutes",
    };
  }
  return null;
}

/**
 * Generic validation combiner
 */
export function validateInput(
  type: string,
  value: number
): ValidationError | null {
  switch (type.toUpperCase()) {
    case "TRANSPORT_KM":
    case "CYCLING_KM":
    case "RUNNING_KM":
      return validateTransportDistance(value);
    case "ELECTRICITY_KWH":
    case "ELECTRICITY_UNITS":
      return validateElectricityUnits(value);
    case "WATER_LITRE":
    case "WATER_ACTIVITY":
      return validateWaterLitres(value);
    case "PLASTIC_KG":
      return validatePlasticWeight(value);
    case "WATER_DURATION":
      return validateWaterDuration(value);
    default:
      return null;
  }
}
