/**
 * Impact Engine Type Definitions
 * Core types for scientific impact calculations
 */

export interface ImpactInput {
  type: string; // TRANSPORT_KM, ELECTRICITY_KWH, WATER_LITRE, PLASTIC_KG, etc.
  value: number; // Measured value
  unit: string; // Unit of measurement
  metadata?: Record<string, any>; // Additional context
}

export interface ImpactOutput {
  co2_kg_saved: number;
  electricity_wh_saved: number;
  water_litre_saved: number;
  waste_kg_prevented: number;
}

export interface CalculationResult {
  input: ImpactInput;
  output: ImpactOutput;
  formula: string;
  calculatedAt: string;
  isValid: boolean;
}

export interface ValidationError {
  field: string;
  value: any;
  minValue?: number;
  maxValue?: number;
  reason: string;
}

export interface NormalizationResult {
  originalValue: number;
  originalUnit: string;
  normalizedValue: number;
  normalizedUnit: string;
}
