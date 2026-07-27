/**
 * Impact Engine - Public API
 * Exports all calculator, validator, and normalizer functions
 */

export {
  calculateImpact,
  calculateTransportImpact,
  calculateElectricityImpact,
  calculateWaterImpact,
  calculatePlasticImpact,
  calculateWaterActivityImpact,
  calculateBatchImpact,
  aggregateImpacts,
} from "./calculator";

export type {
  ImpactInput,
  ImpactOutput,
  CalculationResult,
  ValidationError,
  NormalizationResult,
} from "./types";

export {
  validateTransportDistance,
  validateElectricityUnits,
  validateWaterLitres,
  validatePlasticWeight,
  validateWaterDuration,
  validateInput,
  ValidationException,
} from "./validators";

export {
  normalizeDistance,
  normalizeElectricity,
  normalizeWater,
  normalizeWeight,
  normalizeTime,
} from "./normalizers";
