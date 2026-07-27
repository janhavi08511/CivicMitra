/**
 * Challenge Seed Data with Impact Calculations
 * Updated schema with scientific impact formulas
 * 
 * To seed this data, run:
 * npm run seed
 * 
 * WARNING: This creates/overwrites challenges in Firestore
 */

import { Category, Difficulty, Challenge, ImpactType } from "../types";

export const SEED_CHALLENGES_WITH_IMPACT: Challenge[] = [
  // ============================================================================
  // TRANSPORT CHALLENGES
  // ============================================================================
  {
    challengeId: "cycling-5km",
    title: "Cycle 5 KM",
    description: "Cycle 5 km instead of driving to reduce carbon emissions and stay active.",
    shortDescription: "Cycle 5 km and upload GPS proof or photo.",
    category: Category.TRANSPORT,
    difficulty: Difficulty.EASY,
    points: 20,
    bonusPointsStreak: 5,
    iconEmoji: "🚴",
    bannerImageUrl: "https://picsum.photos/seed/cycling/800/400",
    proofInstructions: "Upload a screenshot of your cycling tracker (Strava, Google Maps, etc) or a photo with timestamp.",
    isDaily: true,
    isActive: true,
    impactCalculation: {
      type: ImpactType.TRANSPORT,
      formula: "distance_km * 0.21",
      conversionFactors: {
        co2_kg: 0.21,
        electricity_wh: 150,
        water_litre: 0.5,
        waste_kg: 0.01,
      },
      inputType: "MANUAL",
      verificationMethod: "AI_IMAGE",
    },
  },

  {
    challengeId: "walk-10k-steps",
    title: "10,000 Steps Walk",
    description: "Walk 10,000 steps to replace car travel and improve health.",
    shortDescription: "Walk 10,000 steps (~7 km equivalent).",
    category: Category.TRANSPORT,
    difficulty: Difficulty.MEDIUM,
    points: 25,
    bonusPointsStreak: 5,
    iconEmoji: "🚶",
    bannerImageUrl: "https://picsum.photos/seed/walking/800/400",
    proofInstructions: "Upload a screenshot from your fitness tracker (Apple Health, Google Fit, etc) showing 10,000+ steps.",
    isDaily: false,
    isActive: true,
    impactCalculation: {
      type: ImpactType.TRANSPORT,
      formula: "steps * 0.000762 * 0.21", // Convert steps to km, then to CO2
      conversionFactors: {
        co2_kg: 0.21, // Per km equivalent
        electricity_wh: 150,
        water_litre: 0.5,
        waste_kg: 0.01,
      },
      inputType: "MANUAL",
      verificationMethod: "AI_IMAGE",
    },
  },

  {
    challengeId: "public-transport-day",
    title: "Public Transport Day",
    description: "Use public transport instead of private car for your daily commute.",
    shortDescription: "Use public transport today.",
    category: Category.TRANSPORT,
    difficulty: Difficulty.MEDIUM,
    points: 30,
    bonusPointsStreak: 5,
    iconEmoji: "🚌",
    bannerImageUrl: "https://picsum.photos/seed/bus/800/400",
    proofInstructions: "Upload a photo of your ticket, receipt, or app confirmation.",
    isDaily: false,
    isActive: true,
    impactCalculation: {
      type: ImpactType.TRANSPORT,
      formula: "distance_km * 0.08", // Public transport emits less
      conversionFactors: {
        co2_kg: 0.08, // Lower than car
        electricity_wh: 50,
        water_litre: 0.2,
        waste_kg: 0.005,
      },
      inputType: "MANUAL",
      verificationMethod: "AI_IMAGE",
    },
  },

  // ============================================================================
  // ELECTRICITY CHALLENGES
  // ============================================================================
  {
    challengeId: "lights-out-hour",
    title: "Lights Out Hour",
    description: "Turn off all non-essential lights for 1 hour to save electricity.",
    shortDescription: "Turn off lights for 1 hour.",
    category: Category.ENERGY,
    difficulty: Difficulty.EASY,
    points: 15,
    bonusPointsStreak: 3,
    iconEmoji: "💡",
    bannerImageUrl: "https://picsum.photos/seed/lights/800/400",
    proofInstructions: "Upload a photo of your room in darkness or with only essential lighting.",
    isDaily: true,
    isActive: true,
    impactCalculation: {
      type: ImpactType.ELECTRICITY,
      formula: "1 hour * 0.1 kWh", // 100W avg light × 1 hour
      conversionFactors: {
        co2_kg: 0.082, // 0.82 per kWh
        electricity_wh: 100,
        water_litre: 0.027,
        waste_kg: 0.0001,
      },
      inputType: "MANUAL",
      verificationMethod: "AI_IMAGE",
    },
  },

  {
    challengeId: "ac-free-day",
    title: "AC Free Day",
    description: "Go the whole day without using air conditioning.",
    shortDescription: "No AC for 24 hours.",
    category: Category.ENERGY,
    difficulty: Difficulty.HARD,
    points: 50,
    bonusPointsStreak: 10,
    iconEmoji: "❄️",
    bannerImageUrl: "https://picsum.photos/seed/ac/800/400",
    proofInstructions: "Upload a selfie showing your thermostat turned off.",
    isDaily: false,
    isActive: true,
    impactCalculation: {
      type: ImpactType.ELECTRICITY,
      formula: "8 kWh", // Average AC usage per day
      conversionFactors: {
        co2_kg: 0.82,
        electricity_wh: 1000,
        water_litre: 0.27,
        waste_kg: 0.001,
      },
      inputType: "MANUAL",
      verificationMethod: "AI_IMAGE",
    },
  },

  // ============================================================================
  // WATER CHALLENGES
  // ============================================================================
  {
    challengeId: "short-shower",
    title: "5 Minute Shower",
    description: "Take a shower in under 5 minutes to save water and energy.",
    shortDescription: "Shower under 5 minutes.",
    category: Category.WATER,
    difficulty: Difficulty.EASY,
    points: 15,
    bonusPointsStreak: 3,
    iconEmoji: "🚿",
    bannerImageUrl: "https://picsum.photos/seed/shower/800/400",
    proofInstructions: "Upload a photo of a timer showing time under 5:00.",
    isDaily: true,
    isActive: true,
    impactCalculation: {
      type: ImpactType.WATER,
      formula: "5 minutes * 15 L", // Standard shower: 15 L/min, average 8 min = 75 L saved
      conversionFactors: {
        co2_kg: 0.0002,
        electricity_wh: 500, // Heating water
        water_litre: 75,
        waste_kg: 0,
      },
      inputType: "MANUAL",
      verificationMethod: "AI_IMAGE",
    },
  },

  {
    challengeId: "reusable-bottle",
    title: "Reusable Water Bottle",
    description: "Use a reusable water bottle instead of buying plastic bottles.",
    shortDescription: "Carry and use reusable bottle.",
    category: Category.WATER,
    difficulty: Difficulty.EASY,
    points: 10,
    bonusPointsStreak: 2,
    iconEmoji: "🌊",
    bannerImageUrl: "https://picsum.photos/seed/bottle/800/400",
    proofInstructions: "Upload a photo of your reusable bottle.",
    isDaily: true,
    isActive: true,
    impactCalculation: {
      type: ImpactType.PLASTIC,
      formula: "1 plastic bottle avoided", // ~500mL bottle
      conversionFactors: {
        co2_kg: 0.15, // Production + transport
        electricity_wh: 50,
        water_litre: 7.5,
        waste_kg: 0.025, // Weight of plastic bottle
      },
      inputType: "IMAGE",
      verificationMethod: "AI_IMAGE",
    },
  },

  // ============================================================================
  // PLASTIC & WASTE CHALLENGES
  // ============================================================================
  {
    challengeId: "plastic-collection",
    title: "Collect Plastic Waste",
    description: "Collect and properly dispose of plastic waste from your community.",
    shortDescription: "Collect plastic waste (1-5 kg).",
    category: Category.WASTE,
    difficulty: Difficulty.MEDIUM,
    points: 30,
    bonusPointsStreak: 5,
    iconEmoji: "♻️",
    bannerImageUrl: "https://picsum.photos/seed/recycling/800/400",
    proofInstructions: "Upload a photo of collected plastic before disposal.",
    isDaily: false,
    isActive: true,
    impactCalculation: {
      type: ImpactType.PLASTIC,
      formula: "weight_kg * 5.9",
      conversionFactors: {
        co2_kg: 5.9, // Per kg plastic
        electricity_wh: 20000,
        water_litre: 300,
        waste_kg: 1,
      },
      inputType: "IMAGE",
      verificationMethod: "AI_IMAGE",
    },
  },

  {
    challengeId: "zero-waste-day",
    title: "Zero Waste Day",
    description: "Try to produce zero trash for an entire day.",
    shortDescription: "No trash produced for 24 hours.",
    category: Category.WASTE,
    difficulty: Difficulty.HARD,
    points: 40,
    bonusPointsStreak: 10,
    iconEmoji: "🌱",
    bannerImageUrl: "https://picsum.photos/seed/trash/800/400",
    proofInstructions: "Upload a photo showing your zero waste meal or activities.",
    isDaily: false,
    isActive: true,
    impactCalculation: {
      type: ImpactType.WASTE,
      formula: "2 kg avoided", // Average daily waste
      conversionFactors: {
        co2_kg: 2, // Landfill decomposition emissions avoided
        electricity_wh: 100,
        water_litre: 50,
        waste_kg: 2,
      },
      inputType: "IMAGE",
      verificationMethod: "AI_IMAGE",
    },
  },

  // ============================================================================
  // COMMUNITY CHALLENGES
  // ============================================================================
  {
    challengeId: "plant-tree",
    title: "Plant a Tree",
    description: "Plant a tree in your community for long-term environmental impact.",
    shortDescription: "Plant 1 tree.",
    category: Category.COMMUNITY,
    difficulty: Difficulty.MEDIUM,
    points: 35,
    bonusPointsStreak: 5,
    iconEmoji: "🌳",
    bannerImageUrl: "https://picsum.photos/seed/tree/800/400",
    proofInstructions: "Upload a photo with you and the planted tree.",
    isDaily: false,
    isActive: true,
    impactCalculation: {
      type: ImpactType.ACTIVITY,
      formula: "20 kg CO2/year", // Average tree absorbs 20kg CO2/year
      conversionFactors: {
        co2_kg: 20, // Lifetime impact calculation
        electricity_wh: 0,
        water_litre: 0,
        waste_kg: 0,
      },
      inputType: "IMAGE",
      verificationMethod: "AI_IMAGE",
    },
  },

  {
    challengeId: "beach-cleanup",
    title: "Beach Cleanup",
    description: "Clean up a beach or waterway to protect marine ecosystems.",
    shortDescription: "Participate in cleanup.",
    category: Category.COMMUNITY,
    difficulty: Difficulty.MEDIUM,
    points: 40,
    bonusPointsStreak: 8,
    iconEmoji: "🏖️",
    bannerImageUrl: "https://picsum.photos/seed/beach/800/400",
    proofInstructions: "Upload a group photo or before/after photo of cleanup.",
    isDaily: false,
    isActive: true,
    impactCalculation: {
      type: ImpactType.PLASTIC,
      formula: "5 kg plastic average",
      conversionFactors: {
        co2_kg: 29.5, // 5 kg × 5.9
        electricity_wh: 100000,
        water_litre: 1500,
        waste_kg: 5,
      },
      inputType: "IMAGE",
      verificationMethod: "AI_IMAGE",
    },
  },
];

/**
 * Export function to seed challenges to Firestore
 * Usage: import { seedChallengesWithImpact } from './seeds'
 */
export function seedChallengesWithImpact() {
  console.log(`✅ ${SEED_CHALLENGES_WITH_IMPACT.length} challenges ready to seed`);
  console.log("To seed, use Firestore Admin SDK or Firebase Console");
  return SEED_CHALLENGES_WITH_IMPACT;
}
