/**
 * Data Normalizers for Impact Engine
 * Converts various units to standardized units for calculations
 */

import { NormalizationResult } from "./types";

/**
 * Normalize distance to kilometers
 */
export function normalizeDistance(
  value: number,
  unit: string
): NormalizationResult {
  let normalizedValue = value;
  const upperUnit = unit.toUpperCase();

  switch (upperUnit) {
    case "KM":
    case "KILOMETER":
    case "KILOMETRES":
      normalizedValue = value;
      break;
    case "M":
    case "METER":
    case "METRES":
      normalizedValue = value / 1000;
      break;
    case "MILE":
    case "MILES":
      normalizedValue = value * 1.60934;
      break;
    case "STEP":
    case "STEPS":
      // Average step length: 0.762m
      normalizedValue = (value * 0.762) / 1000;
      break;
    case "MM":
    case "MILLIMETER":
      normalizedValue = value / 1000000;
      break;
    default:
      normalizedValue = value; // Assume km if unknown
  }

  return {
    originalValue: value,
    originalUnit: unit,
    normalizedValue: parseFloat(normalizedValue.toFixed(4)),
    normalizedUnit: "km",
  };
}

/**
 * Normalize electricity to kWh
 * India standard: 1 unit = 1 kWh
 */
export function normalizeElectricity(
  value: number,
  unit: string
): NormalizationResult {
  let normalizedValue = value;
  const upperUnit = unit.toUpperCase();

  switch (upperUnit) {
    case "KWH":
    case "KILOWATT_HOUR":
    case "KILOWATT-HOUR":
      normalizedValue = value;
      break;
    case "WH":
    case "WATT_HOUR":
    case "WATT-HOUR":
      normalizedValue = value / 1000;
      break;
    case "MWH":
    case "MEGAWATT_HOUR":
      normalizedValue = value * 1000;
      break;
    case "UNIT":
    case "UNITS":
    case "INDIA_UNIT":
      // India: 1 unit = 1 kWh
      normalizedValue = value;
      break;
    case "J":
    case "JOULE":
      // 1 kWh = 3.6 MJ
      normalizedValue = value / 3600000;
      break;
    default:
      normalizedValue = value; // Assume kWh if unknown
  }

  return {
    originalValue: value,
    originalUnit: unit,
    normalizedValue: parseFloat(normalizedValue.toFixed(2)),
    normalizedUnit: "kWh",
  };
}

/**
 * Normalize volume to litres
 */
export function normalizeWater(
  value: number,
  unit: string
): NormalizationResult {
  let normalizedValue = value;
  const upperUnit = unit.toUpperCase();

  switch (upperUnit) {
    case "L":
    case "LITRE":
    case "LITER":
    case "LITERS":
      normalizedValue = value;
      break;
    case "ML":
    case "MILLILITRE":
    case "MILLILITER":
      normalizedValue = value / 1000;
      break;
    case "GALLON":
    case "GALLONS":
    case "US_GALLON":
      normalizedValue = value * 3.78541;
      break;
    case "M3":
    case "CUBIC_METER":
    case "CUBIC_METRE":
      normalizedValue = value * 1000;
      break;
    case "PINT":
    case "PINTS":
      // 1 pint = 0.473176 L
      normalizedValue = value * 0.473176;
      break;
    default:
      normalizedValue = value; // Assume litres if unknown
  }

  return {
    originalValue: value,
    originalUnit: unit,
    normalizedValue: parseFloat(normalizedValue.toFixed(2)),
    normalizedUnit: "L",
  };
}

/**
 * Normalize weight to kilograms
 */
export function normalizeWeight(
  value: number,
  unit: string
): NormalizationResult {
  let normalizedValue = value;
  const upperUnit = unit.toUpperCase();

  switch (upperUnit) {
    case "KG":
    case "KILOGRAM":
    case "KILOGRAMS":
      normalizedValue = value;
      break;
    case "G":
    case "GRAM":
    case "GRAMS":
      normalizedValue = value / 1000;
      break;
    case "MG":
    case "MILLIGRAM":
      normalizedValue = value / 1000000;
      break;
    case "LB":
    case "POUND":
    case "POUNDS":
      normalizedValue = value * 0.453592;
      break;
    case "OZ":
    case "OUNCE":
    case "OUNCES":
      normalizedValue = value * 0.0283495;
      break;
    case "T":
    case "TONNE":
    case "METRIC_TON":
      normalizedValue = value * 1000;
      break;
    default:
      normalizedValue = value; // Assume kg if unknown
  }

  return {
    originalValue: value,
    originalUnit: unit,
    normalizedValue: parseFloat(normalizedValue.toFixed(4)),
    normalizedUnit: "kg",
  };
}

/**
 * Normalize time to minutes
 */
export function normalizeTime(
  value: number,
  unit: string
): NormalizationResult {
  let normalizedValue = value;
  const upperUnit = unit.toUpperCase();

  switch (upperUnit) {
    case "MIN":
    case "MINUTE":
    case "MINUTES":
      normalizedValue = value;
      break;
    case "SEC":
    case "SECOND":
    case "SECONDS":
      normalizedValue = value / 60;
      break;
    case "HR":
    case "HOUR":
    case "HOURS":
      normalizedValue = value * 60;
      break;
    default:
      normalizedValue = value; // Assume minutes if unknown
  }

  return {
    originalValue: value,
    originalUnit: unit,
    normalizedValue: parseFloat(normalizedValue.toFixed(2)),
    normalizedUnit: "min",
  };
}
