/**
 * Metadata Verification Module for Fraud Detection
 * 
 * Validates:
 * - Timestamp consistency
 * - File integrity
 * - EXIF data presence
 * - Metadata tampering detection
 * - File properties (size, type)
 */

import { MetadataVerification } from "../types";

/**
 * Extract EXIF data from image (simplified implementation)
 * In production, use exif-parser library
 */
export function extractExifData(file: File): Record<string, any> {
  // Simplified EXIF extraction
  // In production, use: npm install piexifjs
  const exif: Record<string, any> = {
    fileSize: file.size,
    fileType: file.type,
    lastModified: new Date(file.lastModified).toISOString(),
  };

  return exif;
}

/**
 * Verify timestamp consistency
 * Checks if submission timestamp matches file metadata
 */
export function verifyTimestamp(
  submissionTimestamp: Date | string,
  fileTimestamp?: Date | string
): { isValid: boolean; consistency: number; flags: string[] } {
  const flags: string[] = [];
  const submission = new Date(submissionTimestamp);
  const now = new Date();

  // Check 1: Timestamp not in future
  if (submission > now) {
    flags.push("Submission timestamp is in the future");
    return { isValid: false, consistency: 0, flags };
  }

  // Check 2: Timestamp not too old (older than 1 year)
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  if (submission < oneYearAgo) {
    flags.push("Submission timestamp is older than 1 year");
  }

  // Check 3: Timestamp not too recent (less than 10 seconds)
  const tenSecondsAgo = new Date(now.getTime() - 10 * 1000);
  if (submission > tenSecondsAgo) {
    flags.push("Submission timestamp is suspiciously recent");
  }

  // Check 4: Compare with file timestamp if available
  let consistency = 1.0;
  if (fileTimestamp) {
    const file = new Date(fileTimestamp);
    const timeDiffMs = Math.abs(submission.getTime() - file.getTime());
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

    // Allow up to 24 hours difference
    if (timeDiffHours > 24) {
      flags.push(`File timestamp differs by ${Math.floor(timeDiffHours)} hours`);
      consistency = Math.max(0, 1 - timeDiffHours / 72); // Degrade over 3 days
    }
  }

  return {
    isValid: flags.length === 0,
    consistency: Math.max(0, Math.min(1, consistency)),
    flags,
  };
}

/**
 * Validate file integrity
 * Checks for signs of tampering or manipulation
 */
export function validateFileIntegrity(file: File): {
  isValid: boolean;
  isTampered: boolean;
  flags: string[];
} {
  const flags: string[] = [];
  let isTampered = false;

  // Check 1: File size reasonable
  const maxSizeMB = 50;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size === 0) {
    flags.push("File size is 0 bytes");
    isTampered = true;
  }
  if (file.size > maxSizeBytes) {
    flags.push(`File size exceeds ${maxSizeMB}MB limit`);
    isTampered = true;
  }

  // Check 2: MIME type matches extension
  const expectedMimeTypes: { [key: string]: string[] } = {
    ".jpg": ["image/jpeg"],
    ".jpeg": ["image/jpeg"],
    ".png": ["image/png"],
    ".gif": ["image/gif"],
    ".webp": ["image/webp"],
    ".mp4": ["video/mp4"],
    ".mov": ["video/quicktime"],
  };

  const extension = "." + file.name.split(".").pop()?.toLowerCase();
  const validMimes = expectedMimeTypes[extension];
  if (validMimes && !validMimes.includes(file.type)) {
    flags.push(
      `MIME type mismatch: ${file.type} for ${extension} file`
    );
    isTampered = true;
  }

  // Check 3: File not recently modified after submission
  const fileModified = new Date(file.lastModified);
  const now = new Date();
  const timeSinceModification = now.getTime() - fileModified.getTime();
  const hoursSinceModification = timeSinceModification / (1000 * 60 * 60);

  if (hoursSinceModification < 0.1) {
    // Less than 6 minutes
    flags.push("File was modified very recently");
  }

  return {
    isValid: !isTampered && flags.length === 0,
    isTampered,
    flags,
  };
}

/**
 * Check timestamp consistency
 */
export function checkTimestampConsistency(
  submissionTime: Date | string,
  fileModifiedTime?: Date | string,
  challengeCompletionTime?: Date | string
): {
  score: number; // 0-1
  flags: string[];
} {
  const flags: string[] = [];
  let score = 1.0;

  const submission = new Date(submissionTime);

  // Check against challenge completion time if provided
  if (challengeCompletionTime) {
    const completion = new Date(challengeCompletionTime);
    const diffMs = Math.abs(submission.getTime() - completion.getTime());
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes > 60) {
      flags.push(`Submission is ${Math.floor(diffMinutes)} minutes after challenge completion`);
      score = Math.max(0, score - 0.3);
    } else if (diffMinutes > 10) {
      flags.push(`Submission is ${Math.floor(diffMinutes)} minutes after completion`);
      score = Math.max(0, score - 0.1);
    }
  }

  // Check against file modified time if provided
  if (fileModifiedTime) {
    const fileTime = new Date(fileModifiedTime);
    const diffMs = Math.abs(submission.getTime() - fileTime.getTime());
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 24) {
      flags.push(`File modified ${Math.floor(diffHours)} hours before submission`);
      score = Math.max(0, score - 0.2);
    }
  }

  return { score: Math.max(0, Math.min(1, score)), flags };
}

/**
 * Detect metadata spoofing
 */
export function detectMetadataSpoofing(
  submissionTime: Date | string,
  claimedActivityTime?: Date | string,
  metadata?: Record<string, any>
): {
  spoofingDetected: boolean;
  confidence: number; // 0-1
  flags: string[];
} {
  const flags: string[] = [];
  let spoofingScore = 0;

  // Check 1: EXIF timestamp manipulation
  if (metadata?.exif?.DateTime) {
    try {
      const exifTime = new Date(metadata.exif.DateTime);
      const submission = new Date(submissionTime);
      const diffDays = Math.abs(exifTime.getTime() - submission.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays > 1) {
        flags.push(`EXIF timestamp differs by ${Math.floor(diffDays)} days`);
        spoofingScore += 0.3;
      }
    } catch (e) {
      flags.push("Invalid EXIF timestamp format");
      spoofingScore += 0.2;
    }
  }

  // Check 2: Missing EXIF data (common in edited images)
  if (!metadata?.exif) {
    flags.push("No EXIF data present (may indicate editing)");
    spoofingScore += 0.15;
  }

  // Check 3: GPS data inconsistency
  if (metadata?.exif?.GPSLatitude && metadata?.exif?.GPSLongitude) {
    // Would compare against user's known location
    flags.push("GPS data present but not yet validated against user location");
  }

  // Check 4: Suspicious metadata patterns
  if (metadata?.software && metadata.software.includes("Photoshop")) {
    flags.push("Image edited with professional software");
    spoofingScore += 0.2;
  }

  return {
    spoofingDetected: spoofingScore > 0.3,
    confidence: Math.min(1, spoofingScore),
    flags,
  };
}

/**
 * Analyze file properties
 */
export function analyzeFileProperties(file: File): {
  fileSize: number;
  mimeType: string;
  extension: string;
  isValidImageType: boolean;
  isValidVideoType: boolean;
} {
  const extension =
    "." + file.name.split(".").pop()?.toLowerCase() || "";

  const validImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const validVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];

  return {
    fileSize: file.size,
    mimeType: file.type,
    extension,
    isValidImageType: validImageTypes.includes(file.type),
    isValidVideoType: validVideoTypes.includes(file.type),
  };
}

/**
 * Verify file integrity and metadata
 */
export async function verifyFileMetadata(
  file: File,
  submissionTime: Date | string,
  expectedCompletionTime?: Date | string
): Promise<MetadataVerification> {
  const timestamp = new Date(submissionTime).toISOString();

  try {
    // Extract metadata
    const exifData = extractExifData(file);

    // Check integrity
    const integrity = validateFileIntegrity(file);

    // Check timestamp
    const timestampCheck = verifyTimestamp(submissionTime, file.lastModified);

    // Check consistency
    const consistency = checkTimestampConsistency(
      submissionTime,
      new Date(file.lastModified),
      expectedCompletionTime
    );

    // Check for spoofing
    const spoofing = detectMetadataSpoofing(submissionTime, expectedCompletionTime, exifData);

    // Analyze file properties
    const properties = analyzeFileProperties(file);

    return {
      timestamp,
      extractedTimestamp: new Date(file.lastModified).toISOString(),
      timeConsistency: consistency.score,
      location: undefined, // Would extract GPS if available
      locationConsistency: 0.5, // Neutral until checked
      fileSize: file.size,
      mimeType: file.type,
      exifData,
      hasValidEXIF: !!exifData,
      isTampered: integrity.isTampered || spoofing.spoofingDetected,
    };
  } catch (error) {
    console.error("Error verifying file metadata:", error);
    // Return conservative result on error
    return {
      timestamp,
      extractedTimestamp: new Date(file.lastModified).toISOString(),
      timeConsistency: 0.5,
      fileSize: file.size,
      mimeType: file.type,
      hasValidEXIF: false,
      isTampered: false,
      locationConsistency: 0.5,
    };
  }
}

/**
 * Quick metadata check (for fast validation)
 */
export function quickMetadataCheck(file: File): {
  valid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  // Check file size
  if (file.size === 0) {
    issues.push("Empty file");
    score -= 50;
  } else if (file.size > 50 * 1024 * 1024) {
    issues.push("File too large");
    score -= 30;
  }

  // Check MIME type
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
  ];
  if (!validTypes.includes(file.type)) {
    issues.push(`Invalid file type: ${file.type}`);
    score -= 40;
  }

  // Check extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov"];
  if (!validExtensions.includes(extension || "")) {
    issues.push(`Invalid extension: ${extension}`);
    score -= 20;
  }

  return {
    valid: score >= 60,
    score: Math.max(0, score),
    issues,
  };
}
