/**
 * Impact Service - Service Layer
 * Bridges impact engine calculations with application logic
 */

import {
  calculateImpact,
  ImpactInput,
  ImpactOutput,
  CalculationResult,
  aggregateImpacts,
} from "../lib/impact-engine";
import { ImpactData } from "../types";

/**
 * Service for managing impact calculations
 * Handles formatting, aggregation, and integration with application
 */
export class ImpactService {
  /**
   * Calculate impact and format as ImpactData for database storage
   */
  static calculateAndFormat(input: ImpactInput): ImpactData {
    try {
      const result = calculateImpact(input);

      return {
        measuredValue: input.value,
        measuredUnit: input.unit,
        calculatedImpacts: result.output,
        verificationDetails: {
          method: "CALCULATED",
          score: 1.0,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to calculate impact: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Calculate impact with custom verification details
   */
  static calculateWithVerification(
    input: ImpactInput,
    verificationMethod: string,
    verificationScore: number
  ): ImpactData {
    const result = calculateImpact(input);

    return {
      measuredValue: input.value,
      measuredUnit: input.unit,
      calculatedImpacts: result.output,
      verificationDetails: {
        method: verificationMethod,
        score: Math.min(Math.max(verificationScore, 0), 1),
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Get total aggregated impact from multiple ImpactData objects
   */
  static getTotalImpact(impacts: ImpactData[]): ImpactOutput {
    if (impacts.length === 0) {
      return {
        co2_kg_saved: 0,
        electricity_wh_saved: 0,
        water_litre_saved: 0,
        waste_kg_prevented: 0,
      };
    }

    return impacts.reduce(
      (total, impact) => ({
        co2_kg_saved: total.co2_kg_saved + impact.calculatedImpacts.co2_kg_saved,
        electricity_wh_saved:
          total.electricity_wh_saved + impact.calculatedImpacts.electricity_wh_saved,
        water_litre_saved:
          total.water_litre_saved + impact.calculatedImpacts.water_litre_saved,
        waste_kg_prevented:
          total.waste_kg_prevented + impact.calculatedImpacts.waste_kg_prevented,
      }),
      {
        co2_kg_saved: 0,
        electricity_wh_saved: 0,
        water_litre_saved: 0,
        waste_kg_prevented: 0,
      }
    );
  }

  /**
   * Format impact output for display
   */
  static formatImpactForDisplay(impact: ImpactOutput) {
    return {
      co2: {
        value: impact.co2_kg_saved,
        unit: "kg",
        formatted: `${impact.co2_kg_saved.toFixed(2)} kg`,
      },
      electricity: {
        value: impact.electricity_wh_saved,
        unit: "Wh",
        formatted:
          impact.electricity_wh_saved >= 1000
            ? `${(impact.electricity_wh_saved / 1000).toFixed(2)} kWh`
            : `${impact.electricity_wh_saved.toFixed(1)} Wh`,
      },
      water: {
        value: impact.water_litre_saved,
        unit: "L",
        formatted:
          impact.water_litre_saved >= 1000
            ? `${(impact.water_litre_saved / 1000).toFixed(2)} kL`
            : `${impact.water_litre_saved.toFixed(1)} L`,
      },
      waste: {
        value: impact.waste_kg_prevented,
        unit: "kg",
        formatted: `${impact.waste_kg_prevented.toFixed(2)} kg`,
      },
    };
  }

  /**
   * Calculate equivalent trees planted (CO2 absorption standard)
   * Average tree absorbs ~20 kg CO2 per year
   */
  static getEquivalentTrees(co2_kg: number): number {
    return Math.round((co2_kg / 20) * 100) / 100; // Divide by 20 kg/year per tree
  }

  /**
   * Calculate fuel liters saved (average car: 10 L/100km)
   */
  static getEquivalentFuelSaved(distance_km: number): number {
    return Math.round(((distance_km / 100) * 10) * 100) / 100; // 10 L per 100 km
  }

  /**
   * Get impact statistics for a time period
   */
  static calculateImpactStats(impacts: ImpactData[], period: "day" | "week" | "month") {
    const total = this.getTotalImpact(impacts);
    const average = {
      co2_kg_saved: total.co2_kg_saved / (impacts.length || 1),
      electricity_wh_saved: total.electricity_wh_saved / (impacts.length || 1),
      water_litre_saved: total.water_litre_saved / (impacts.length || 1),
      waste_kg_prevented: total.waste_kg_prevented / (impacts.length || 1),
    };

    return {
      count: impacts.length,
      total,
      average,
      period,
      trees: this.getEquivalentTrees(total.co2_kg_saved),
      fuelEquivalent: impacts.some(
        (i) =>
          i.verificationDetails.method.includes("TRANSPORT") ||
          i.measuredUnit.toLowerCase().includes("km")
      )
        ? this.getEquivalentFuelSaved(
            impacts
              .filter(
                (i) =>
                  i.verificationDetails.method.includes("TRANSPORT") ||
                  i.measuredUnit.toLowerCase().includes("km")
              )
              .reduce((sum, i) => sum + i.measuredValue, 0)
          )
        : 0,
    };
  }

  /**
   * Compare two time periods for impact analysis
   */
  static compareImpactPeriods(
    previousImpacts: ImpactData[],
    currentImpacts: ImpactData[]
  ) {
    const previous = this.getTotalImpact(previousImpacts);
    const current = this.getTotalImpact(currentImpacts);

    return {
      previous,
      current,
      change: {
        co2_kg: current.co2_kg_saved - previous.co2_kg_saved,
        electricity_wh: current.electricity_wh_saved - previous.electricity_wh_saved,
        water_litre: current.water_litre_saved - previous.water_litre_saved,
        waste_kg: current.waste_kg_prevented - previous.waste_kg_prevented,
      },
      percentChange: {
        co2_kg:
          previous.co2_kg_saved > 0
            ? ((current.co2_kg_saved - previous.co2_kg_saved) / previous.co2_kg_saved) * 100
            : 0,
        electricity_wh:
          previous.electricity_wh_saved > 0
            ? ((current.electricity_wh_saved - previous.electricity_wh_saved) /
                previous.electricity_wh_saved) *
              100
            : 0,
        water_litre:
          previous.water_litre_saved > 0
            ? ((current.water_litre_saved - previous.water_litre_saved) /
                previous.water_litre_saved) *
              100
            : 0,
        waste_kg:
          previous.waste_kg_prevented > 0
            ? ((current.waste_kg_prevented - previous.waste_kg_prevented) /
                previous.waste_kg_prevented) *
              100
            : 0,
      },
      improved: {
        co2_kg: current.co2_kg_saved >= previous.co2_kg_saved,
        electricity_wh: current.electricity_wh_saved >= previous.electricity_wh_saved,
        water_litre: current.water_litre_saved >= previous.water_litre_saved,
        waste_kg: current.waste_kg_prevented >= previous.waste_kg_prevented,
      },
    };
  }
}
