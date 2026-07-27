/**
 * Pattern Analysis Module for Fraud Detection
 * 
 * Detects:
 * - Unsustainable activity patterns (too many submissions too fast)
 * - Sudden activity spikes
 * - Coordinated fraud (multiple accounts, same IP)
 * - Behavioral anomalies vs. user baseline
 */

export interface UserActivityBaseline {
  avgSubmissionsPerDay: number;
  avgPointsPerDay: number;
  peakHours: number[]; // 0-23
  typicalDayOfWeek: number[]; // 0-6
  averageTimeBetweenSubmissions: number; // minutes
}

/**
 * Analyze challenge submission pattern
 * Compares current submission to user's history
 */
export function analyzeChallengePattern(
  userSubmissionHistory: Array<{
    timestamp: Date;
    challengeId: string;
    points: number;
  }>,
  currentSubmissionTime: Date,
  currentChallengeId: string,
  currentPoints: number
): {
  isAnomalous: boolean;
  score: number; // 0-1 (0 = normal, 1 = highly anomalous)
  flags: string[];
} {
  const flags: string[] = [];
  let anomalyScore = 0;

  if (userSubmissionHistory.length === 0) {
    return { isAnomalous: false, score: 0, flags: ["No history available"] };
  }

  // Check 1: Duplicate challenge submission
  const recentDuplicates = userSubmissionHistory.filter(
    (sub) =>
      sub.challengeId === currentChallengeId &&
      currentSubmissionTime.getTime() - sub.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24h
  );

  if (recentDuplicates.length > 0) {
    flags.push(`Duplicate submission within 24 hours (${recentDuplicates.length} times)`);
    anomalyScore += 0.4;
  }

  // Check 2: Points inflation check
  const avgPoints =
    userSubmissionHistory.reduce((sum, sub) => sum + sub.points, 0) /
    userSubmissionHistory.length;
  if (currentPoints > avgPoints * 3) {
    flags.push(`Points much higher than average: ${currentPoints} vs ${avgPoints.toFixed(0)}`);
    anomalyScore += 0.2;
  }

  // Check 3: Highly similar challenges submitted
  const similarChallengeSubmissions = userSubmissionHistory.filter(
    (sub) =>
      isSimilarChallenge(sub.challengeId, currentChallengeId) &&
      currentSubmissionTime.getTime() - sub.timestamp.getTime() < 2 * 60 * 60 * 1000 // Last 2 hours
  );

  if (similarChallengeSubmissions.length >= 3) {
    flags.push(
      `${similarChallengeSubmissions.length} similar challenges in 2 hours`
    );
    anomalyScore += 0.25;
  }

  return {
    isAnomalous: anomalyScore > 0.3,
    score: Math.min(1, anomalyScore),
    flags,
  };
}

/**
 * Check if two challenges are similar (same category, similar requirements)
 */
function isSimilarChallenge(challenge1Id: string, challenge2Id: string): boolean {
  // In production, would use database to check challenge metadata
  // For now, simple ID comparison
  const category1 = challenge1Id.split("-")[0];
  const category2 = challenge2Id.split("-")[0];
  return category1 === category2;
}

/**
 * Detect unsustainable activity patterns
 */
export function detectUnsustainablePattern(
  submissions: Array<{ timestamp: Date; points: number }>,
  timeWindowMinutes: number = 60
): {
  isUnsustainable: boolean;
  score: number; // 0-1
  flags: string[];
  submissionsInWindow: number;
  pointsInWindow: number;
} {
  const flags: string[] = [];
  let score = 0;

  if (submissions.length < 3) {
    return {
      isUnsustainable: false,
      score: 0,
      flags: ["Not enough data"],
      submissionsInWindow: submissions.length,
      pointsInWindow: submissions.reduce((sum, s) => sum + s.points, 0),
    };
  }

  // Find most recent window with most activity
  const now = new Date();
  const recentSubmissions = submissions.filter(
    (sub) =>
      now.getTime() - sub.timestamp.getTime() < timeWindowMinutes * 60 * 1000
  );

  const pointsInWindow = recentSubmissions.reduce((sum, s) => sum + s.points, 0);

  // Check 1: Too many submissions in time window
  const maxReasonableSubmissions = Math.ceil((timeWindowMinutes / 60) * 2); // Max 2 per hour
  if (recentSubmissions.length > maxReasonableSubmissions * 3) {
    flags.push(
      `${recentSubmissions.length} submissions in ${timeWindowMinutes} minutes (max reasonable: ${maxReasonableSubmissions * 3})`
    );
    score += 0.4;
  }

  // Check 2: Too many points in time window
  const maxReasonablePoints = 500; // Max 500 points in 1 hour
  if (pointsInWindow > maxReasonablePoints && timeWindowMinutes <= 60) {
    flags.push(`${pointsInWindow} points in ${timeWindowMinutes} minutes`);
    score += 0.3;
  }

  // Check 3: Perfect time intervals (bot-like behavior)
  if (recentSubmissions.length >= 3) {
    const intervals: number[] = [];
    for (let i = 1; i < recentSubmissions.length; i++) {
      const intervalMs =
        recentSubmissions[i].timestamp.getTime() -
        recentSubmissions[i - 1].timestamp.getTime();
      intervals.push(intervalMs);
    }

    // Check if intervals are too regular
    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < avgInterval * 0.05) {
      // Very regular intervals (< 5% variance)
      flags.push("Suspiciously regular submission intervals (bot-like)");
      score += 0.3;
    }
  }

  return {
    isUnsustainable: score > 0.3,
    score: Math.min(1, score),
    flags,
    submissionsInWindow: recentSubmissions.length,
    pointsInWindow,
  };
}

/**
 * Check submission timing for anomalies
 */
export function checkSubmissionTiming(
  submissions: Array<{ timestamp: Date }>,
  baseline?: UserActivityBaseline
): {
  isAnomalous: boolean;
  score: number;
  flags: string[];
  hourOfDay: number;
  dayOfWeek: number;
  isNighttime: boolean;
} {
  const flags: string[] = [];
  let score = 0;

  const lastSubmission = submissions[submissions.length - 1];
  const hourOfDay = lastSubmission.timestamp.getHours();
  const dayOfWeek = lastSubmission.timestamp.getDay();
  const isNighttime = hourOfDay < 6 || hourOfDay > 23;

  // Check 1: Unusual time pattern
  if (isNighttime) {
    flags.push(`Submission at unusual time: ${hourOfDay}:00`);
    score += 0.1;
  }

  // Check 2: Activity spike
  if (submissions.length > 10) {
    const lastDay = submissions.filter(
      (sub) =>
        Date.now() - sub.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    const avgPerDay =
      submissions.filter(
        (sub) =>
          Date.now() - sub.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
      ).length / 7;

    if (lastDay.length > avgPerDay * 3) {
      flags.push(
        `${lastDay.length} submissions today vs ${avgPerDay.toFixed(1)} daily average`
      );
      score += 0.2;
    }
  }

  // Check 3: Against baseline if provided
  if (baseline) {
    if (!baseline.peakHours.includes(hourOfDay)) {
      flags.push(`Submission outside user's typical peak hours`);
      score += 0.1;
    }

    if (!baseline.typicalDayOfWeek.includes(dayOfWeek)) {
      flags.push(
        `Submission on atypical day of week for this user`
      );
      score += 0.1;
    }
  }

  return {
    isAnomalous: score > 0.25,
    score: Math.min(1, score),
    flags,
    hourOfDay,
    dayOfWeek,
    isNighttime,
  };
}

/**
 * Detect coordinated fraud (multiple accounts)
 */
export function detectCoordinatedFraud(
  submissions: Array<{ userId: string; timestamp: Date; ipAddress?: string }>,
  userIds: string[]
): {
  coordinatedFraudDetected: boolean;
  score: number;
  flags: string[];
  suspiciousGroups: Array<{
    userIds: string[];
    reason: string;
    confidence: number;
  }>;
} {
  const flags: string[] = [];
  let score = 0;
  const suspiciousGroups: Array<{
    userIds: string[];
    reason: string;
    confidence: number;
  }> = [];

  // Check 1: Same IP address submitting from multiple accounts
  const ipMap = new Map<string, string[]>();
  for (const sub of submissions) {
    if (sub.ipAddress) {
      const users = ipMap.get(sub.ipAddress) || [];
      if (!users.includes(sub.userId)) {
        users.push(sub.userId);
      }
      ipMap.set(sub.ipAddress, users);
    }
  }

  for (const [ip, users] of ipMap) {
    if (users.length > 2) {
      flags.push(`${users.length} accounts from IP ${ip}`);
      suspiciousGroups.push({
        userIds: users,
        reason: `Multiple accounts from same IP: ${ip}`,
        confidence: Math.min(1, users.length / 10),
      });
      score += 0.3;
    }
  }

  // Check 2: Identical submission patterns
  if (userIds.length >= 2) {
    // Check timestamps between accounts
    const timeGaps: number[] = [];
    for (let i = 0; i < userIds.length - 1; i++) {
      const user1Subs = submissions.filter((s) => s.userId === userIds[i]);
      const user2Subs = submissions.filter((s) => s.userId === userIds[i + 1]);

      if (user1Subs.length > 0 && user2Subs.length > 0) {
        for (const sub1 of user1Subs.slice(-5)) {
          // Last 5 of user1
          for (const sub2 of user2Subs.slice(-5)) {
            // Last 5 of user2
            const gap = Math.abs(
              sub1.timestamp.getTime() - sub2.timestamp.getTime()
            );
            if (gap < 5 * 60 * 1000) {
              // Within 5 minutes
              timeGaps.push(gap);
            }
          }
        }
      }
    }

    if (timeGaps.length >= 3) {
      flags.push(
        `${timeGaps.length} submissions within 5 minutes across accounts`
      );
      suspiciousGroups.push({
        userIds,
        reason: "Synchronized submission patterns across accounts",
        confidence: Math.min(1, timeGaps.length / 10),
      });
      score += 0.3;
    }
  }

  return {
    coordinatedFraudDetected: score > 0.3,
    score: Math.min(1, score),
    flags,
    suspiciousGroups,
  };
}

/**
 * Calculate user risk score
 */
export function calculateUserRiskScore(
  userSubmissionHistory: Array<{
    timestamp: Date;
    verified: boolean;
    fraudScore?: number;
  }>,
  userProfile?: {
    createdAt: Date;
    previousFraudFlags: number;
  }
): {
  riskScore: number; // 0-100
  trustLevel: "trusted" | "normal" | "suspicious" | "blocked";
  flags: string[];
} {
  const flags: string[] = [];
  let score = 50; // Neutral baseline

  if (userSubmissionHistory.length === 0) {
    return {
      riskScore: 50,
      trustLevel: "normal",
      flags: ["No submission history"],
    };
  }

  // Check 1: Approval rate
  const approved = userSubmissionHistory.filter((s) => s.verified).length;
  const approvalRate = approved / userSubmissionHistory.length;

  if (approvalRate > 0.95) {
    score -= 20; // Very trustworthy
    flags.push("High approval rate (>95%)");
  } else if (approvalRate < 0.5) {
    score += 20; // Many rejections
    flags.push("Low approval rate (<50%)");
  }

  // Check 2: Fraud flags history
  if (userProfile?.previousFraudFlags) {
    score += userProfile.previousFraudFlags * 5;
    flags.push(
      `${userProfile.previousFraudFlags} previous fraud flags`
    );
  }

  // Check 3: Account age
  if (userProfile?.createdAt) {
    const accountAgeMs = Date.now() - userProfile.createdAt.getTime();
    const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);

    if (accountAgeDays < 7) {
      score += 20;
      flags.push("Very new account");
    } else if (accountAgeDays < 30) {
      score += 10;
      flags.push("New account");
    }
  }

  // Check 4: Average fraud score
  const fraudScores = userSubmissionHistory
    .filter((s) => s.fraudScore)
    .map((s) => s.fraudScore || 0);
  if (fraudScores.length > 0) {
    const avgFraudScore = fraudScores.reduce((a, b) => a + b) / fraudScores.length;
    score += avgFraudScore * 0.5; // Weight it 50%
  }

  // Normalize to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine trust level
  let trustLevel: "trusted" | "normal" | "suspicious" | "blocked";
  if (score < 20) trustLevel = "trusted";
  else if (score < 50) trustLevel = "normal";
  else if (score < 80) trustLevel = "suspicious";
  else trustLevel = "blocked";

  return { riskScore: score, trustLevel, flags };
}

/**
 * Compare to baseline activity
 */
export function compareToBaselineActivity(
  currentMetrics: { submissionsPerDay: number; avgPointsPerSubmission: number },
  baseline: UserActivityBaseline
): {
  isDeviation: boolean;
  deviationScore: number; // 0-1
  flags: string[];
} {
  const flags: string[] = [];
  let deviationScore = 0;

  // Check submission frequency
  const submissionDifference = currentMetrics.submissionsPerDay / baseline.avgSubmissionsPerDay;
  if (submissionDifference > 3) {
    flags.push(`${submissionDifference.toFixed(1)}x normal submission rate`);
    deviationScore = Math.min(1, (submissionDifference - 1) / 10);
  }

  // Check points per submission
  const pointsDifference = currentMetrics.avgPointsPerSubmission / baseline.avgPointsPerDay;
  if (pointsDifference > 2) {
    flags.push(`${pointsDifference.toFixed(1)}x normal points per submission`);
    deviationScore = Math.max(deviationScore, Math.min(1, (pointsDifference - 1) / 5));
  }

  return {
    isDeviation: deviationScore > 0.3,
    deviationScore: Math.min(1, deviationScore),
    flags,
  };
}
