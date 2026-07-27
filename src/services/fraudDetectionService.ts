/**
 * Fraud Detection Service
 * 
 * Orchestrates all fraud detection layers:
 * - Image Analysis (40% weight)
 * - Metadata Verification (20% weight)
 * - Geolocation Validation (20% weight)
 * - Pattern Analysis (20% weight)
 * 
 * Produces comprehensive fraud score and recommendation
 */

import { FraudScore, FraudRiskLevel, UserTrustScore, Completion } from "../types";
import { analyzeImage, isDuplicate } from "./imageAnalyzer";
import { verifyFileMetadata, quickMetadataCheck } from "./metadataValidator";
import { validateLocationForSubmission } from "./geolocationValidator";
import {
  analyzeChallengePattern,
  detectUnsustainablePattern,
  checkSubmissionTiming,
  calculateUserRiskScore,
  UserActivityBaseline,
} from "./patternAnalyzer";

export interface AnalysisContext {
  submissionId: string;
  completionId: string;
  userId: string;
  challengeId: string;
  imageFile: File | Blob;
  imageUrl?: string;
  submissionTime: Date;
  userProfile?: {
    uid: string;
    createdAt: string;
    totalSubmissions?: number;
  };
  userSubmissionHistory?: Array<{
    timestamp: Date;
    challengeId: string;
    points: number;
    verified: boolean;
  }>;
  previousImageHashes?: string[];
  userLocations?: Array<{ lat: number; lng: number; timestamp: Date }>;
  challengeMetadata?: {
    title: string;
    category: string;
    location?: { lat: number; lng: number };
  };
}

export class FraudDetectionService {
  /**
   * Analyze a submission for fraud
   * Runs all detection layers and returns comprehensive score
   */
  static async analyzeSubmission(context: AnalysisContext): Promise<FraudScore> {
    const startTime = Date.now();

    try {
      // Run all analyses in parallel
      const [imageAnalysis, metadataAnalysis, locationAnalysis, patternAnalysis] =
        await Promise.all([
          this.analyzeImageLayer(context),
          this.analyzeMetadataLayer(context),
          this.analyzeLocationLayer(context),
          this.analyzePatternLayer(context),
        ]);

      // Calculate weighted fraud score
      const fraudScore = this.calculateWeightedScore({
        imageAnalysis,
        metadataAnalysis,
        locationAnalysis,
        patternAnalysis,
      });

      console.log(
        `[Fraud Detection] Analysis completed in ${Date.now() - startTime}ms for submission ${context.submissionId}`
      );

      return fraudScore;
    } catch (error) {
      console.error("Error in fraud analysis:", error);
      // Return conservative score on error (flag for review)
      return {
        submissionId: context.submissionId,
        overallScore: 50,
        riskLevel: FraudRiskLevel.MEDIUM,
        breakdown: {
          imageAnalysis: 50,
          metadataAnalysis: 50,
          geolocationAnalysis: 50,
          patternAnalysis: 50,
        },
        details: {
          isDuplicate: false,
          isAIGenerated: false,
          aiConfidence: 0,
          metadataFlags: ["Analysis error - unable to fully evaluate"],
          locationFlags: [],
          patternFlags: [],
          coordinatedFraudSignals: [],
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Image Analysis Layer (40% weight)
   */
  private static async analyzeImageLayer(context: AnalysisContext): Promise<{
    score: number;
    details: any;
  }> {
    const flags: string[] = [];
    let score = 100; // Start at clean

    try {
      // Analyze image
      const imageAnalysis = await analyzeImage(context.imageFile, context.imageUrl);

      // Check for AI generation
      if (imageAnalysis.aiProbability > 0.7) {
        flags.push(`AI-generated content detected: ${(imageAnalysis.aiProbability * 100).toFixed(0)}% confidence`);
        score -= 40;
      } else if (imageAnalysis.aiProbability > 0.4) {
        flags.push(`Possible AI-generated content: ${(imageAnalysis.aiProbability * 100).toFixed(0)}% confidence`);
        score -= 20;
      }

      // Check for duplicates
      if (context.previousImageHashes && context.previousImageHashes.length > 0) {
        for (const prevHash of context.previousImageHashes) {
          const similarity = this.calculateHashSimilarity(imageAnalysis.hash, prevHash);
          if (isDuplicate(similarity)) {
            flags.push(`Duplicate image detected: ${(similarity * 100).toFixed(0)}% match`);
            score -= 35;
            break;
          } else if (similarity > 0.7) {
            flags.push(`Very similar image found: ${(similarity * 100).toFixed(0)}% match`);
            score -= 15;
          }
        }
      }

      // Check image quality
      if (imageAnalysis.quality === "low") {
        flags.push("Low image quality");
        score -= 10;
      }

      // Check for artifacts suggesting manipulation
      if (imageAnalysis.artifacts) {
        if (imageAnalysis.artifacts.perfectSymmetry) {
          flags.push("Perfect symmetry detected");
          score -= 10;
        }
        if (imageAnalysis.artifacts.watermarkPattern) {
          flags.push("Watermark or repeated pattern detected");
          score -= 15;
        }
        if (imageAnalysis.artifacts.colorAnomalies) {
          flags.push("Color anomalies detected");
          score -= 8;
        }
      }

      return {
        score: Math.max(0, score),
        details: {
          isDuplicate: score < 65 && flags.some((f) => f.includes("Duplicate")),
          isAIGenerated: imageAnalysis.aiProbability > 0.7,
          aiConfidence: imageAnalysis.aiProbability,
          flags,
        },
      };
    } catch (error) {
      console.error("Image analysis error:", error);
      return {
        score: 50, // Neutral on error
        details: {
          isDuplicate: false,
          isAIGenerated: false,
          aiConfidence: 0,
          flags: ["Image analysis error"],
        },
      };
    }
  }

  /**
   * Metadata Analysis Layer (20% weight)
   */
  private static async analyzeMetadataLayer(context: AnalysisContext): Promise<{
    score: number;
    details: any;
  }> {
    const flags: string[] = [];
    let score = 100;

    try {
      // Quick check first
      const quickCheck = quickMetadataCheck(context.imageFile);
      if (!quickCheck.valid) {
        flags.push(...quickCheck.issues);
        score -= 40;
      }

      // Detailed verification
      const metadata = await verifyFileMetadata(
        context.imageFile as File,
        context.submissionTime,
        context.submissionTime
      );

      // Check timestamp consistency
      if (metadata.timeConsistency < 0.5) {
        flags.push("Timestamp inconsistency detected");
        score -= 20;
      } else if (metadata.timeConsistency < 0.8) {
        flags.push("Minor timestamp inconsistency");
        score -= 8;
      }

      // Check for tampering
      if (metadata.isTampered) {
        flags.push("Signs of file tampering detected");
        score -= 25;
      }

      // Check EXIF data
      if (!metadata.hasValidEXIF) {
        flags.push("No EXIF data (may indicate editing)");
        score -= 5;
      }

      return {
        score: Math.max(0, score),
        details: {
          flags,
          isTampered: metadata.isTampered,
          fileSize: metadata.fileSize,
          mimeType: metadata.mimeType,
        },
      };
    } catch (error) {
      console.error("Metadata analysis error:", error);
      return {
        score: 50,
        details: {
          flags: ["Metadata analysis error"],
          isTampered: false,
        },
      };
    }
  }

  /**
   * Geolocation Analysis Layer (20% weight)
   */
  private static async analyzeLocationLayer(context: AnalysisContext): Promise<{
    score: number;
    details: any;
  }> {
    const flags: string[] = [];
    let score = 100;

    try {
      // Skip if no location data available
      if (!context.userLocations || context.userLocations.length === 0) {
        return {
          score: 100, // No location data, can't penalize
          details: {
            flags: ["No location data available for validation"],
          },
        };
      }

      // Would extract location from image EXIF in production
      // For now, use last known location
      const lastLocation = context.userLocations[context.userLocations.length - 1];

      const validation = await validateLocationForSubmission(
        lastLocation,
        context.challengeMetadata?.location,
        context.userLocations,
        context.userProfile
          ? { city: "", country: "" }
          : undefined,
        context.submissionTime
      );

      // Score based on validation
      if (!validation.isValid) {
        score -= 30;
        flags.push(...validation.flags);
      } else {
        score -= (1 - validation.score) * 20;
      }

      // Check spoofing details
      if (validation.details.spoofing.detected) {
        flags.push(...validation.details.spoofing.flags);
        score -= 15;
      }

      return {
        score: Math.max(0, score),
        details: {
          flags,
          locationFlags: validation.flags,
          spoofingDetected: validation.details.spoofing.detected,
        },
      };
    } catch (error) {
      console.error("Location analysis error:", error);
      return {
        score: 100, // Can't penalize without data
        details: {
          flags: ["Location analysis skipped"],
          locationFlags: [],
        },
      };
    }
  }

  /**
   * Pattern Analysis Layer (20% weight)
   */
  private static async analyzePatternLayer(context: AnalysisContext): Promise<{
    score: number;
    details: any;
  }> {
    const flags: string[] = [];
    let score = 100;

    try {
      // Skip if no history
      if (!context.userSubmissionHistory || context.userSubmissionHistory.length === 0) {
        return {
          score: 100,
          details: {
            flags: ["No submission history available"],
            patternFlags: [],
          },
        };
      }

      // Check challenge pattern
      const challengePattern = analyzeChallengePattern(
        context.userSubmissionHistory,
        context.submissionTime,
        context.challengeId,
        0 // Points would be known in real context
      );

      if (challengePattern.isAnomalous) {
        score -= challengePattern.score * 20;
        flags.push(...challengePattern.flags);
      }

      // Check unsustainable activity
      const recentSubmissions = context.userSubmissionHistory.filter(
        (sub) =>
          context.submissionTime.getTime() - sub.timestamp.getTime() <
          60 * 60 * 1000
      );

      if (recentSubmissions.length >= 3) {
        const unsustainable = detectUnsustainablePattern(
          recentSubmissions.map((s) => ({
            timestamp: s.timestamp,
            points: s.points,
          })),
          60
        );

        if (unsustainable.isUnsustainable) {
          score -= unsustainable.score * 25;
          flags.push(...unsustainable.flags);
        }
      }

      // Check submission timing
      const timing = checkSubmissionTiming([{ timestamp: context.submissionTime }]);
      if (timing.isAnomalous) {
        score -= timing.score * 10;
        flags.push(...timing.flags);
      }

      // Check user risk
      if (context.userProfile) {
        const userRisk = calculateUserRiskScore(context.userSubmissionHistory, {
          createdAt: new Date(context.userProfile.createdAt),
          previousFraudFlags: 0,
        });

        const riskPenalty = userRisk.riskScore / 200; // 0-0.5
        score -= riskPenalty * 25;
        flags.push(...userRisk.flags);
      }

      return {
        score: Math.max(0, score),
        details: {
          flags,
          patternFlags: flags,
        },
      };
    } catch (error) {
      console.error("Pattern analysis error:", error);
      return {
        score: 100,
        details: {
          flags: ["Pattern analysis error"],
          patternFlags: [],
        },
      };
    }
  }

  /**
   * Calculate weighted fraud score
   */
  private static calculateWeightedScore(layers: {
    imageAnalysis: { score: number; details: any };
    metadataAnalysis: { score: number; details: any };
    locationAnalysis: { score: number; details: any };
    patternAnalysis: { score: number; details: any };
  }): FraudScore {
    // Weights: 40% image, 20% metadata, 20% location, 20% pattern
    const overallScore =
      layers.imageAnalysis.score * 0.4 +
      layers.metadataAnalysis.score * 0.2 +
      layers.locationAnalysis.score * 0.2 +
      layers.patternAnalysis.score * 0.2;

    // Convert clean score (100) to fraud score (0)
    // Clean = 100 → fraud score = 0
    // Suspicious = 50 → fraud score = 50
    // Definitely fraud = 0 → fraud score = 100
    const fraudScore = 100 - overallScore;

    // Determine risk level
    let riskLevel: FraudRiskLevel;
    if (fraudScore < 20) riskLevel = FraudRiskLevel.APPROVED;
    else if (fraudScore < 40) riskLevel = FraudRiskLevel.LOW;
    else if (fraudScore < 60) riskLevel = FraudRiskLevel.MEDIUM;
    else if (fraudScore < 80) riskLevel = FraudRiskLevel.HIGH;
    else riskLevel = FraudRiskLevel.CRITICAL;

    // Combine all flags
    const allFlags = [
      ...layers.imageAnalysis.details.flags,
      ...layers.metadataAnalysis.details.flags,
      ...layers.locationAnalysis.details.flags,
      ...layers.patternAnalysis.details.flags,
    ].filter((f) => f); // Remove empties

    return {
      submissionId: "", // Provided by caller
      overallScore: Math.round(fraudScore),
      riskLevel,
      breakdown: {
        imageAnalysis: Math.round(100 - layers.imageAnalysis.score),
        metadataAnalysis: Math.round(100 - layers.metadataAnalysis.score),
        geolocationAnalysis: Math.round(100 - layers.locationAnalysis.score),
        patternAnalysis: Math.round(100 - layers.patternAnalysis.score),
      },
      details: {
        isDuplicate: allFlags.some((f) => f.includes("Duplicate")),
        isDuplicateOf: undefined,
        isAIGenerated: allFlags.some((f) => f.includes("AI-generated")),
        aiConfidence: layers.imageAnalysis.details.aiConfidence || 0,
        metadataFlags: layers.metadataAnalysis.details.flags || [],
        locationFlags: layers.locationAnalysis.details.locationFlags || [],
        patternFlags: layers.patternAnalysis.details.patternFlags || [],
        coordinatedFraudSignals: [],
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate hash similarity
   */
  private static calculateHashSimilarity(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0;
    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }
    return matches / hash1.length;
  }

  /**
   * Recommend action based on fraud score
   */
  static recommendAction(fraudScore: FraudScore): "APPROVE" | "FLAG" | "REJECT" {
    switch (fraudScore.riskLevel) {
      case FraudRiskLevel.APPROVED:
        return "APPROVE";
      case FraudRiskLevel.LOW:
        return "APPROVE";
      case FraudRiskLevel.MEDIUM:
        return "FLAG";
      case FraudRiskLevel.HIGH:
        return "FLAG";
      case FraudRiskLevel.CRITICAL:
        return "REJECT";
      default:
        return "FLAG";
    }
  }

  /**
   * Update user trust score
   */
  static updateUserTrustScore(
    userTrustScore: UserTrustScore,
    fraudOutcome: "approved" | "rejected"
  ): UserTrustScore {
    if (fraudOutcome === "approved") {
      userTrustScore.submissionsApproved++;
      // Increase trust
      userTrustScore.trustScore = Math.min(
        100,
        userTrustScore.trustScore + 2
      );
    } else {
      userTrustScore.submissionsRejected++;
      userTrustScore.fraudFlags++;
      // Decrease trust
      userTrustScore.trustScore = Math.max(0, userTrustScore.trustScore - 10);
    }

    // Update suspension level
    const approvalRate =
      userTrustScore.submissionsApproved / userTrustScore.submissionsTotal;
    if (approvalRate > 0.9) {
      userTrustScore.suspicionLevel = "trusted";
    } else if (approvalRate > 0.7) {
      userTrustScore.suspicionLevel = "normal";
    } else if (approvalRate > 0.5) {
      userTrustScore.suspicionLevel = "suspicious";
    } else {
      userTrustScore.suspicionLevel = "blocked";
    }

    userTrustScore.lastUpdated = new Date().toISOString();
    return userTrustScore;
  }
}
