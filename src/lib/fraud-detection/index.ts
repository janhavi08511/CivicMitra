/**
 * Fraud Detection Module - Public API
 * 
 * Exports all fraud detection capabilities
 */

// Image Analysis
export {
  generatePerceptualHash,
  calculateImageHash,
  calculateHashSimilarity,
  analyzeForAI,
  analyzeImageQuality,
  extractImageMetadata,
  analyzeImage,
  compareImages,
  isDuplicate,
} from "./imageAnalyzer";

// Metadata Verification
export {
  extractExifData,
  verifyTimestamp,
  validateFileIntegrity,
  checkTimestampConsistency,
  detectMetadataSpoofing,
  analyzeFileProperties,
  verifyFileMetadata,
  quickMetadataCheck,
} from "./metadataValidator";

// Geolocation Validation
export {
  calculateDistance,
  getUserLastLocation,
  extractLocationFromImage,
  validateLocationPlausibility,
  checkLocationConsistency,
  detectLocationSpoofing,
  validateLocationForSubmission,
  getUserDeviceLocation,
} from "./geolocationValidator";

// Pattern Analysis
export {
  analyzeChallengePattern,
  detectUnsustainablePattern,
  checkSubmissionTiming,
  detectCoordinatedFraud,
  calculateUserRiskScore,
  compareToBaselineActivity,
  type UserActivityBaseline,
} from "./patternAnalyzer";

// Types
export type { ImageAnalysis, MetadataVerification, FraudScore, UserTrustScore } from "../types";
export { FraudRiskLevel } from "../types";
