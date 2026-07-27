export enum Role {
  USER = "USER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
}

export enum Category {
  WATER = "WATER",
  ENERGY = "ENERGY",
  TRANSPORT = "TRANSPORT",
  WASTE = "WASTE",
  FOOD = "FOOD",
  COMMUNITY = "COMMUNITY",
  NATURE = "NATURE",
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  MANUAL_REVIEW = "MANUAL_REVIEW",
}

<<<<<<< HEAD
export enum ImpactType {
  TRANSPORT = "TRANSPORT",
  ELECTRICITY = "ELECTRICITY",
  WATER = "WATER",
  PLASTIC = "PLASTIC",
  ACTIVITY = "ACTIVITY",
}

export interface ImpactCalculation {
  type: ImpactType;
  formula: string;
  conversionFactors: {
    co2_kg: number;
    electricity_wh: number;
    water_litre: number;
    waste_kg: number;
  };
  inputType: "GPS" | "BILL_OCR" | "MANUAL" | "IMAGE" | "SENSOR";
  verificationMethod: string;
}

export interface ImpactData {
  measuredValue: number;
  measuredUnit: string;
  calculatedImpacts: {
    co2_kg_saved: number;
    electricity_wh_saved: number;
    water_litre_saved: number;
    waste_kg_prevented: number;
  };
  verificationDetails: {
    method: string;
    score: number;
    timestamp: string;
  };
}

=======
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizAttempt {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  score: number;
  answers: number[];
  submittedAt: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  country?: string;
  totalPoints: number;
  points: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experiencePoints: number;
  role: Role;
  lastActivityDate?: string;
  createdAt: string;
  fcmToken?: string;
}

export interface Challenge {
  challengeId: string;
  title: string;
  description: string;
  shortDescription: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  bonusPointsStreak: number;
  iconEmoji: string;
  bannerImageUrl: string;
  proofInstructions: string;
  isDaily: boolean;
  isActive: boolean;
<<<<<<< HEAD
  impactCalculation?: ImpactCalculation;
=======
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
}

export interface Completion {
  id: string;
  userId: string;
  challengeId: string;
  proofUrl: string;
  proofType: "IMAGE" | "VIDEO";
  caption?: string;
  aiVerificationStatus: VerificationStatus;
  aiVerificationScore: number;
  pointsAwarded: number;
  isStreakDay: boolean;
  submittedAt: string;
  verifiedAt?: string;
  likesCount?: number;
  commentsCount?: number;
<<<<<<< HEAD
  impactData?: ImpactData;
  fraudScore?: FraudScore;           // NEW - Fraud detection analysis
  fraudReviewStatus?: "pending" | "approved" | "rejected"; // NEW
  fraudReviewId?: string;            // NEW - Links to FraudReviewTask
=======
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
}

export interface Badge {
  id: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeIconUrl: string;
  earnedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
<<<<<<< HEAD

// ============================================================================
// PHASE 2: FRAUD DETECTION TYPES
// ============================================================================

export enum FraudRiskLevel {
  APPROVED = "APPROVED",       // 0% risk - automatic approval
  LOW = "LOW",                 // 1-20% risk - approve but monitor
  MEDIUM = "MEDIUM",           // 21-50% risk - require review
  HIGH = "HIGH",               // 51-80% risk - flag for investigation
  CRITICAL = "CRITICAL",       // 81-100% risk - auto-reject
}

export interface ImageAnalysis {
  hash: string;                // Perceptual hash for duplicate detection
  aiProbability: number;       // 0-1 likelihood of AI generation
  realProbability: number;     // 0-1 confidence this is real
  detectedObjects: string[];   // Objects found in image via detection
  quality: "low" | "medium" | "high"; // Image quality assessment
  timestamp: string;           // ISO timestamp of analysis
  artifacts?: {
    perfectSymmetry: boolean;
    unusualBackground: boolean;
    watermarkPattern: boolean;
    colorAnomalies: boolean;
  };
}

export interface MetadataVerification {
  timestamp: string;           // ISO timestamp of submission
  extractedTimestamp?: string; // ISO timestamp from EXIF if available
  timeConsistency: number;     // 0-1 consistency score
  location?: {
    lat: number;
    lng: number;
    accuracy: number;         // Meters
  };
  locationConsistency: number; // 0-1 consistency with user's location
  fileSize: number;            // Bytes
  mimeType: string;            // e.g., "image/jpeg"
  exifData?: Record<string, any>; // Raw EXIF metadata
  hasValidEXIF: boolean;
  isTampered: boolean;         // Signs of metadata manipulation
}

export interface FraudScoreDetails {
  isDuplicate: boolean;
  isDuplicateOf?: string;      // ID of original submission if duplicate
  isAIGenerated: boolean;
  aiConfidence: number;        // 0-1
  metadataFlags: string[];     // List of detected issues
  locationFlags: string[];     // Geolocation issues
  patternFlags: string[];      // Behavior anomalies
  coordinatedFraudSignals: string[]; // Multi-account fraud indicators
}

export interface FraudScore {
  submissionId: string;
  overallScore: number;        // 0-100
  riskLevel: FraudRiskLevel;
  breakdown: {
    imageAnalysis: number;     // 0-100 (40% weight)
    metadataAnalysis: number;  // 0-100 (20% weight)
    geolocationAnalysis: number; // 0-100 (20% weight)
    patternAnalysis: number;   // 0-100 (20% weight)
  };
  details: FraudScoreDetails;
  timestamp: string;           // ISO timestamp of analysis
  reviewedBy?: string;         // Admin user ID if manually reviewed
  reviewNotes?: string;
  manualOverride?: boolean;
}

export interface UserTrustScore {
  userId: string;
  trustScore: number;          // 0-100
  submissionsTotal: number;
  submissionsVerified: number;
  submissionsApproved: number;
  submissionsRejected: number;
  fraudFlags: number;          // Count of times flagged
  suspicionLevel: "trusted" | "normal" | "suspicious" | "blocked";
  lastFlaggedDate?: string;    // ISO timestamp
  automatedDecisions: number;  // Submissions auto-approved
  manualReviews: number;       // Submitted for manual review
  lastUpdated: string;         // ISO timestamp
  trustHistory?: Array<{
    score: number;
    timestamp: string;
    reason: string;
  }>;
}

export interface FraudReviewTask {
  id: string;
  submissionId: string;
  completionId: string;
  userId: string;
  challengeId: string;
  fraudScore: FraudScore;
  status: "pending" | "approved" | "rejected" | "dismissed";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  aiConfidence: number;        // AI verification confidence
  imageUrl: string;
  challengeTitle: string;
}
=======
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
