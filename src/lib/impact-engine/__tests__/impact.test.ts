/**
 * Phase 1 Testing - Impact Engine Verification
 * Tests for scientific calculations and backward compatibility
 */

import {
  calculateTransportImpact,
  calculateElectricityImpact,
  calculateWaterImpact,
  calculatePlasticImpact,
  calculateWaterActivityImpact,
  validateTransportDistance,
  validateElectricityUnits,
  validateWaterLitres,
  validatePlasticWeight,
  normalizeDistance,
  normalizeElectricity,
  normalizeWater,
} from "../src/lib/impact-engine";

import {
  calculateCO2,
  calculateElectricity,
  calculateWater,
  calculateWaste,
  calculateActivityBasedImpact,
  aggregateImpacts,
  migratePointsToActivityImpact,
} from "../src/lib/impact-utils";

import { ImpactService } from "../src/services/impactService";

/**
 * Test Suite 1: Impact Calculations
 */
describe("Impact Engine - Transport Calculations", () => {
  test("10 km cycling should save 2.1 kg CO2", () => {
    const result = calculateTransportImpact(10);
    expect(result.co2_kg_saved).toBe(2.1);
    expect(result.electricity_wh_saved).toBe(1500);
  });

  test("5 km should save 1.05 kg CO2", () => {
    const result = calculateTransportImpact(5);
    expect(result.co2_kg_saved).toBe(1.05);
  });

  test("100 km (max) should work", () => {
    const result = calculateTransportImpact(100);
    expect(result.co2_kg_saved).toBe(21);
  });
});

describe("Impact Engine - Electricity Calculations", () => {
  test("50 kWh saved should save 41 kg CO2", () => {
    const result = calculateElectricityImpact(50);
    expect(result.co2_kg_saved).toBe(41);
  });

  test("1 kWh should save 0.82 kg CO2", () => {
    const result = calculateElectricityImpact(1);
    expect(result.co2_kg_saved).toBe(0.82);
  });

  test("100 kWh should work", () => {
    const result = calculateElectricityImpact(100);
    expect(result.co2_kg_saved).toBe(82);
  });
});

describe("Impact Engine - Water Calculations", () => {
  test("100 L water saved should save 0.02 kg CO2", () => {
    const result = calculateWaterImpact(100);
    expect(result.co2_kg_saved).toBeCloseTo(0.02, 2);
    expect(result.water_litre_saved).toBe(100);
  });

  test("300 L (max) should work", () => {
    const result = calculateWaterImpact(300);
    expect(result.co2_kg_saved).toBeCloseTo(0.06, 2);
  });
});

describe("Impact Engine - Plastic Calculations", () => {
  test("1 kg plastic should save 5.9 kg CO2", () => {
    const result = calculatePlasticImpact(1);
    expect(result.co2_kg_saved).toBe(5.9);
  });

  test("2 kg plastic should save 11.8 kg CO2", () => {
    const result = calculatePlasticImpact(2);
    expect(result.co2_kg_saved).toBe(11.8);
  });
});

describe("Impact Engine - Water Activity Calculations", () => {
  test("5 min shower should save water and energy", () => {
    const result = calculateWaterActivityImpact(5);
    expect(result.water_litre_saved).toBe(75); // 15 L/min
    expect(result.electricity_wh_saved).toBe(500); // 100 Wh/min
  });
});

/**
 * Test Suite 2: Validation
 */
describe("Impact Engine - Validators", () => {
  test("Valid distance should pass", () => {
    const error = validateTransportDistance(10);
    expect(error).toBeNull();
  });

  test("Zero distance should fail", () => {
    const error = validateTransportDistance(0);
    expect(error).not.toBeNull();
    expect(error?.reason).toContain("at least 0.1 km");
  });

  test("Too large distance should fail", () => {
    const error = validateTransportDistance(150);
    expect(error).not.toBeNull();
    expect(error?.reason).toContain("less than 100 km");
  });

  test("Valid electricity units", () => {
    const error = validateElectricityUnits(50);
    expect(error).toBeNull();
  });

  test("Negative electricity should fail", () => {
    const error = validateElectricityUnits(-10);
    expect(error).not.toBeNull();
  });

  test("Too much electricity should fail", () => {
    const error = validateElectricityUnits(1500);
    expect(error).not.toBeNull();
  });
});

/**
 * Test Suite 3: Normalization
 */
describe("Impact Engine - Normalizers", () => {
  test("Normalize 1000 meters to km", () => {
    const result = normalizeDistance(1000, "m");
    expect(result.normalizedValue).toBe(1);
    expect(result.normalizedUnit).toBe("km");
  });

  test("Normalize 1 mile to km", () => {
    const result = normalizeDistance(1, "mile");
    expect(result.normalizedValue).toBeCloseTo(1.60934, 3);
  });

  test("Normalize 1000 Wh to kWh", () => {
    const result = normalizeElectricity(1000, "Wh");
    expect(result.normalizedValue).toBe(1);
    expect(result.normalizedUnit).toBe("kWh");
  });

  test("Normalize 1000 mL to L", () => {
    const result = normalizeWater(1000, "ml");
    expect(result.normalizedValue).toBe(1);
    expect(result.normalizedUnit).toBe("L");
  });
});

/**
 * Test Suite 4: Backward Compatibility
 */
describe("Backward Compatibility - Points-Based Calculations", () => {
  test("100 points should still work with old formula", () => {
    const co2 = calculateCO2(100);
    expect(co2).toBe(5); // 100 * 0.05
  });

  test("Migration from points to activity impact", () => {
    const result = migratePointsToActivityImpact(100);
    expect(result.co2_kg_saved).toBe(5);
    expect(result.electricity_wh_saved).toBe(150);
  });
});

/**
 * Test Suite 5: Impact Service
 */
describe("Impact Service - Formatting", () => {
  test("Format impact for display", () => {
    const impact = {
      co2_kg_saved: 5.123,
      electricity_wh_saved: 1500,
      water_litre_saved: 100,
      waste_kg_prevented: 1.5,
    };

    const formatted = ImpactService.formatImpactForDisplay(impact);
    expect(formatted.co2.formatted).toContain("kg");
    expect(formatted.electricity.formatted).toContain("kWh");
    expect(formatted.water.formatted).toContain("L");
  });

  test("Calculate equivalent trees", () => {
    const trees = ImpactService.getEquivalentTrees(20);
    expect(trees).toBe(1); // 20 kg CO2 = 1 tree
  });

  test("Calculate fuel saved", () => {
    const fuel = ImpactService.getEquivalentFuelSaved(1000);
    expect(fuel).toBe(100); // 1000 km = 100 L
  });
});

/**
 * Test Suite 6: Aggregation
 */
describe("Impact Aggregation", () => {
  test("Aggregate multiple impacts", () => {
    const impacts = [
      {
        co2_kg_saved: 5,
        electricity_wh_saved: 100,
        water_litre_saved: 50,
        waste_kg_prevented: 0.5,
      },
      {
        co2_kg_saved: 3,
        electricity_wh_saved: 50,
        water_litre_saved: 30,
        waste_kg_prevented: 0.3,
      },
    ];

    const total = aggregateImpacts(impacts);
    expect(total.co2_kg_saved).toBe(8);
    expect(total.electricity_wh_saved).toBe(150);
    expect(total.water_litre_saved).toBe(80);
    expect(total.waste_kg_prevented).toBe(0.8);
  });
});

/**
 * Test Suite 7: Comparison Analysis
 */
describe("Impact Comparison", () => {
  test("Compare two periods", () => {
    const previous = [
      {
        measuredValue: 10,
        measuredUnit: "km",
        calculatedImpacts: {
          co2_kg_saved: 2.1,
          electricity_wh_saved: 1500,
          water_litre_saved: 5,
          waste_kg_prevented: 0.1,
        },
        verificationDetails: {
          method: "GPS",
          score: 1,
          timestamp: new Date().toISOString(),
        },
      },
    ];

    const current = [
      {
        measuredValue: 20,
        measuredUnit: "km",
        calculatedImpacts: {
          co2_kg_saved: 4.2,
          electricity_wh_saved: 3000,
          water_litre_saved: 10,
          waste_kg_prevented: 0.2,
        },
        verificationDetails: {
          method: "GPS",
          score: 1,
          timestamp: new Date().toISOString(),
        },
      },
    ];

    const comparison = ImpactService.compareImpactPeriods(previous, current);
    expect(comparison.improved.co2_kg).toBe(true);
    expect(comparison.change.co2_kg).toBe(2.1);
    expect(comparison.percentChange.co2_kg).toBe(100); // 100% improvement
  });
});

console.log("✅ All tests defined. Run with: npm test");
