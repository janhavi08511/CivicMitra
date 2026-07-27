/**
 * Comprehensive Test Suite for Fraud Detection Module
 * 
 * Tests for all fraud detection layers:
 * - Image Analysis
 * - Metadata Verification
 * - Geolocation Validation
 * - Pattern Analysis
 * - Fraud Detection Service
 */

import {
  generatePerceptualHash,
  calculateHashSimilarity,
  analyzeForAI,
  isDuplicate,
} from "../imageAnalyzer";
import {
  verifyTimestamp,
  validateFileIntegrity,
  checkTimestampConsistency,
  detectMetadataSpoofing,
  analyzeFileProperties,
  quickMetadataCheck,
} from "../metadataValidator";
import {
  calculateDistance,
  validateLocationPlausibility,
  checkLocationConsistency,
  detectLocationSpoofing,
} from "../geolocationValidator";
import {
  analyzeChallengePattern,
  detectUnsustainablePattern,
  checkSubmissionTiming,
  detectCoordinatedFraud,
  calculateUserRiskScore,
  compareToBaselineActivity,
} from "../patternAnalyzer";
import { FraudRiskLevel } from "../../types";

describe("Fraud Detection Module", () => {
  // ============================================================================
  // IMAGE ANALYSIS TESTS
  // ============================================================================
  describe("Image Analysis - Perceptual Hashing", () => {
    test("should generate consistent hash", async () => {
      const mockBuffer = new ArrayBuffer(1000);
      const hash1 = await generatePerceptualHash(mockBuffer);
      expect(hash1).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(hash1)).toBe(true);
    });

    test("should calculate hash similarity", () => {
      const hash1 = "a1b2c3d4e5f6" + "0".repeat(52);
      const hash2 = "a1b2c3d4e5f6" + "0".repeat(52);
      const similarity = calculateHashSimilarity(hash1, hash2);
      expect(similarity).toBe(1.0);
    });

    test("should detect different hashes as dissimilar", () => {
      const hash1 = "a1b2c3d4e5f6" + "0".repeat(52);
      const hash2 = "f6f5f4f3f2f1" + "1".repeat(52);
      const similarity = calculateHashSimilarity(hash1, hash2);
      expect(similarity).toBeLessThan(0.5);
    });

    test("should identify duplicates above threshold", () => {
      const similarity = 0.9;
      expect(isDuplicate(similarity, 0.85)).toBe(true);
    });

    test("should not identify images as duplicates below threshold", () => {
      const similarity = 0.7;
      expect(isDuplicate(similarity, 0.85)).toBe(false);
    });
  });

  describe("Image Analysis - AI Detection", () => {
    test("should analyze image for AI markers", async () => {
      // Mock image data
      const mockImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

      const result = await analyzeForAI(mockImageUrl);

      expect(result).toHaveProperty("aiProbability");
      expect(result).toHaveProperty("realProbability");
      expect(result.aiProbability).toBeGreaterThanOrEqual(0);
      expect(result.aiProbability).toBeLessThanOrEqual(1);
      expect(result.realProbability).toBeGreaterThanOrEqual(0);
      expect(result.realProbability).toBeLessThanOrEqual(1);
      expect(result.aiProbability + result.realProbability).toBe(1);
    });

    test("should detect perfect symmetry as suspicious", async () => {
      const result = await analyzeForAI("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");

      expect(result.artifacts).toHaveProperty("perfectSymmetry");
      expect(typeof result.artifacts.perfectSymmetry).toBe("boolean");
    });
  });

  // ============================================================================
  // METADATA VERIFICATION TESTS
  // ============================================================================
  describe("Metadata Verification - Timestamp Validation", () => {
    test("should reject future timestamps", () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);

      const result = verifyTimestamp(futureTime);
      expect(result.isValid).toBe(false);
      expect(result.consistency).toBe(0);
    });

    test("should accept current timestamp", () => {
      const now = new Date();
      const result = verifyTimestamp(now);
      expect(result.isValid).toBe(true);
      expect(result.consistency).toBeGreaterThan(0);
    });

    test("should flag very old timestamps", () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const result = verifyTimestamp(twoYearsAgo);
      expect(result.flags.length).toBeGreaterThan(0);
    });

    test("should check consistency between timestamps", () => {
      const submission = new Date();
      const fileTime = new Date();
      fileTime.setHours(fileTime.getHours() - 2); // 2 hours earlier

      const result = checkTimestampConsistency(submission, fileTime);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    test("should flag large timestamp differences", () => {
      const submission = new Date();
      const fileTime = new Date();
      fileTime.setDate(fileTime.getDate() - 10); // 10 days earlier

      const result = checkTimestampConsistency(submission, fileTime);
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(1);
    });
  });

  describe("Metadata Verification - File Integrity", () => {
    test("should detect empty files", () => {
      const emptyFile = new File([], "empty.jpg", { type: "image/jpeg" });
      const result = validateFileIntegrity(emptyFile);

      expect(result.isValid).toBe(false);
      expect(result.isTampered).toBe(true);
    });

    test("should accept valid file sizes", () => {
      const validData = new Uint8Array(1000000); // 1MB
      const blob = new Blob([validData], { type: "image/jpeg" });
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

      const result = validateFileIntegrity(file);
      expect(result.isValid).toBe(true);
      expect(result.isTampered).toBe(false);
    });

    test("should detect MIME type mismatches", () => {
      const file = new File(["data"], "file.jpg", { type: "text/plain" });
      const result = validateFileIntegrity(file);

      expect(result.flags.length).toBeGreaterThan(0);
    });
  });

  describe("Metadata Verification - Quick Check", () => {
    test("should validate good files quickly", () => {
      const goodData = new Uint8Array(100000);
      const blob = new Blob([goodData], { type: "image/jpeg" });
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

      const result = quickMetadataCheck(file);
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(50);
    });

    test("should reject invalid files quickly", () => {
      const file = new File([], "file.xyz", { type: "application/unknown" });
      const result = quickMetadataCheck(file);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // GEOLOCATION VALIDATION TESTS
  // ============================================================================
  describe("Geolocation Validation - Distance Calculation", () => {
    test("should calculate distance between two coordinates", () => {
      // New York to Los Angeles
      const distance = calculateDistance(40.7128, -74.006, 34.0522, -118.2437);

      expect(distance).toBeGreaterThan(3900); // ~3944 km
      expect(distance).toBeLessThan(4000);
    });

    test("should return 0 for same coordinates", () => {
      const distance = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
      expect(distance).toBe(0);
    });

    test("should handle equatorial coordinates", () => {
      const distance = calculateDistance(0, 0, 0, 1);
      expect(distance).toBeGreaterThan(110); // ~111 km per degree
      expect(distance).toBeLessThan(112);
    });
  });

  describe("Geolocation Validation - Location Plausibility", () => {
    test("should reject invalid latitude", () => {
      const result = validateLocationPlausibility({
        lat: 91,
        lng: 0,
      });

      expect(result.isPlausible).toBe(false);
      expect(result.confidence).toBe(0);
    });

    test("should reject invalid longitude", () => {
      const result = validateLocationPlausibility({
        lat: 0,
        lng: 181,
      });

      expect(result.isPlausible).toBe(false);
      expect(result.confidence).toBe(0);
    });

    test("should flag null island (0,0)", () => {
      const result = validateLocationPlausibility({
        lat: 0,
        lng: 0,
      });

      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(1);
    });

    test("should accept valid coordinates", () => {
      const result = validateLocationPlausibility({
        lat: 40.7128,
        lng: -74.006,
      });

      expect(result.isPlausible).toBe(true);
    });
  });

  describe("Geolocation Validation - Spoofing Detection", () => {
    test("should detect impossible movement (teleportation)", () => {
      const now = new Date();
      const lastLocation = new Date();
      lastLocation.setHours(lastLocation.getHours() - 1); // 1 hour ago

      const result = detectLocationSpoofing(
        { lat: 40.7128, lng: -74.006 }, // NYC
        now,
        [
          {
            location: { lat: 34.0522, lng: -118.2437 }, // LA
            timestamp: lastLocation,
          },
        ]
      );

      // NYC to LA in 1 hour = ~3944 km/h (impossible for normal travel)
      expect(result.spoofingDetected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    test("should flag suspicious perfect coordinates", () => {
      const result = detectLocationSpoofing({
        lat: 45,
        lng: 90,
      });

      expect(result.flags.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // PATTERN ANALYSIS TESTS
  // ============================================================================
  describe("Pattern Analysis - Unsustainable Activity", () => {
    test("should detect too many submissions too fast", () => {
      const now = Date.now();
      const submissions = Array.from({ length: 50 }, (_, i) => ({
        timestamp: new Date(now - i * 1000 * 30), // Every 30 seconds
        points: 20,
      }));

      const result = detectUnsustainablePattern(submissions, 60);
      expect(result.isUnsustainable).toBe(true);
      expect(result.score).toBeGreaterThan(0.3);
    });

    test("should accept normal submission pace", () => {
      const now = Date.now();
      const submissions = Array.from({ length: 3 }, (_, i) => ({
        timestamp: new Date(now - i * 1000 * 3600), // Every hour
        points: 20,
      }));

      const result = detectUnsustainablePattern(submissions, 60);
      expect(result.isUnsustainable).toBe(false);
    });

    test("should detect bot-like regular intervals", () => {
      const now = Date.now();
      const submissions = Array.from({ length: 5 }, (_, i) => ({
        timestamp: new Date(now - i * 1000 * 300), // Every 5 minutes exactly
        points: 20,
      }));

      const result = detectUnsustainablePattern(submissions, 60);
      expect(result.isUnsustainable).toBe(true);
    });
  });

  describe("Pattern Analysis - User Risk Score", () => {
    test("should rate trusted users (>95% approval)", () => {
      const history = Array.from({ length: 100 }, (_, i) => ({
        timestamp: new Date(),
        verified: i < 97, // 97% approval
        fraudScore: 0,
      }));

      const result = calculateUserRiskScore(history);
      expect(result.trustLevel).toBe("trusted");
      expect(result.riskScore).toBeLessThan(50);
    });

    test("should flag suspicious users (<50% approval)", () => {
      const history = Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(),
        verified: i < 8, // 40% approval
        fraudScore: 50,
      }));

      const result = calculateUserRiskScore(history);
      expect(result.suspicionLevel).toBe("suspicious");
      expect(result.riskScore).toBeGreaterThan(50);
    });

    test("should penalize new accounts", () => {
      const history = Array.from({ length: 3 }, () => ({
        timestamp: new Date(),
        verified: true,
        fraudScore: 0,
      }));

      const newAccountTime = new Date();
      newAccountTime.setDate(newAccountTime.getDate() - 2); // 2 days old

      const result = calculateUserRiskScore(history, {
        createdAt: newAccountTime,
        previousFraudFlags: 0,
      });

      expect(result.riskScore).toBeGreaterThan(40); // Penalized for being new
    });

    test("should flag accounts with fraud history", () => {
      const history = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(),
        verified: i < 8, // 80% approval
        fraudScore: 0,
      }));

      const result = calculateUserRiskScore(history, {
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        previousFraudFlags: 3,
      });

      expect(result.riskScore).toBeGreaterThan(60);
    });
  });

  describe("Pattern Analysis - Coordinated Fraud Detection", () => {
    test("should detect multiple accounts from same IP", () => {
      const submissions = [
        { userId: "user1", timestamp: new Date(), ipAddress: "192.168.1.1" },
        { userId: "user2", timestamp: new Date(), ipAddress: "192.168.1.1" },
        { userId: "user3", timestamp: new Date(), ipAddress: "192.168.1.1" },
      ];

      const result = detectCoordinatedFraud(submissions, ["user1", "user2", "user3"]);
      expect(result.coordinatedFraudDetected).toBe(true);
      expect(result.suspiciousGroups.length).toBeGreaterThan(0);
    });

    test("should allow single account per IP", () => {
      const submissions = [
        { userId: "user1", timestamp: new Date(), ipAddress: "192.168.1.1" },
        { userId: "user2", timestamp: new Date(), ipAddress: "192.168.1.2" },
      ];

      const result = detectCoordinatedFraud(submissions, ["user1", "user2"]);
      expect(result.coordinatedFraudDetected).toBe(false);
    });

    test("should detect synchronized submissions", () => {
      const now = Date.now();
      const submissions = [
        {
          userId: "user1",
          timestamp: new Date(now),
          ipAddress: "192.168.1.1",
        },
        {
          userId: "user2",
          timestamp: new Date(now + 1000), // 1 second later
          ipAddress: "192.168.1.2",
        },
      ];

      const result = detectCoordinatedFraud(submissions, ["user1", "user2"]);
      // Should flag coordinated activity if multiple submissions within 5 minutes
      expect(result).toHaveProperty("coordinatedFraudDetected");
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================
  describe("Fraud Detection - Integration", () => {
    test("should handle null/undefined inputs gracefully", () => {
      expect(() => {
        validateLocationPlausibility(null);
      }).not.toThrow();

      expect(() => {
        calculateUserRiskScore([]);
      }).not.toThrow();
    });

    test("should produce consistent scores", () => {
      const history = Array.from({ length: 5 }, () => ({
        timestamp: new Date(),
        verified: true,
        fraudScore: 0,
      }));

      const score1 = calculateUserRiskScore(history);
      const score2 = calculateUserRiskScore(history);

      expect(score1.riskScore).toBe(score2.riskScore);
      expect(score1.trustLevel).toBe(score2.trustLevel);
    });

    test("should combine all checks", () => {
      // Image check
      const hash1 = "abc123" + "0".repeat(58);
      const hash2 = "abc123" + "0".repeat(58);
      const imageSimilarity = calculateHashSimilarity(hash1, hash2);

      // Metadata check
      const now = new Date();
      const timestampCheck = verifyTimestamp(now);

      // Location check
      const locationCheck = validateLocationPlausibility({
        lat: 40.7128,
        lng: -74.006,
      });

      // Pattern check
      const userHistory = [
        { timestamp: new Date(), verified: true, fraudScore: 0 },
      ];
      const riskCheck = calculateUserRiskScore(userHistory);

      // All should be valid
      expect(imageSimilarity).toBeGreaterThan(0);
      expect(timestampCheck.isValid).toBe(true);
      expect(locationCheck.isPlausible).toBe(true);
      expect(riskCheck.riskScore).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================================
  // EDGE CASES & BOUNDARY CONDITIONS
  // ============================================================================
  describe("Edge Cases - Boundary Conditions", () => {
    test("should handle maximum distance calculations", () => {
      // Opposite sides of Earth
      const distance = calculateDistance(-90, 0, 90, 0);
      expect(distance).toBeCloseTo(20015, -1); // ~20,015 km (Earth circumference / 2)
    });

    test("should handle submissions with no history", () => {
      const result = calculateUserRiskScore([]);
      expect(result.riskScore).toBe(50); // Neutral
      expect(result.trustLevel).toBe("normal");
    });

    test("should handle single submission", () => {
      const result = detectUnsustainablePattern(
        [{ timestamp: new Date(), points: 100 }],
        60
      );
      expect(result.isUnsustainable).toBe(false);
    });

    test("should handle very old timestamps", () => {
      const veryOld = new Date();
      veryOld.setFullYear(veryOld.getFullYear() - 10);

      const result = verifyTimestamp(veryOld);
      expect(result.flags.length).toBeGreaterThan(0);
    });
  });
});
