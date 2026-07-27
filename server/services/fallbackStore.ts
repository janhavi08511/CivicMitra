type StoredUser = {
  uid: string;
  email: string;
  fullName?: string;
  username?: string;
  role?: string;
  points?: number;
  totalPoints?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type StoredCompletion = {
  id: string;
  userId: string;
  challengeId: string;
  proofUrl?: string;
  pointsAwarded?: number;
  aiVerificationStatus?: string;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

type StoredChallenge = {
  challengeId: string;
  title: string;
  description: string;
  shortDescription?: string;
  category?: string;
  difficulty?: string;
  points?: number;
  bonusPointsStreak?: number;
  iconEmoji?: string;
  bannerImageUrl?: string;
  proofInstructions?: string;
  isDaily?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const fallbackChallenges: StoredChallenge[] = [
  {
    challengeId: 'cleanup-neighbourhood',
    title: 'Clean the neighbourhood',
    description: 'Pick up litter in your local area and share proof.',
    shortDescription: 'Community cleanup',
    category: 'COMMUNITY',
    difficulty: 'EASY',
    points: 120,
    bonusPointsStreak: 20,
    iconEmoji: '🧹',
    bannerImageUrl: '',
    proofInstructions: 'Upload a photo before and after cleaning.',
    isDaily: false,
    isActive: true,
  },
  {
    challengeId: 'bike-ride',
    title: 'Ride a bike today',
    description: 'Use a bicycle for your commute or a short trip.',
    shortDescription: 'Low-carbon mobility',
    category: 'TRANSPORT',
    difficulty: 'MEDIUM',
    points: 180,
    bonusPointsStreak: 30,
    iconEmoji: '🚲',
    bannerImageUrl: '',
    proofInstructions: 'Share a photo or short note.',
    isDaily: false,
    isActive: true,
  },
];

const fallbackUsers = new Map<string, StoredUser>();
const fallbackCompletions: StoredCompletion[] = [];

export function getFallbackChallenges(includeInactive = false) {
  return includeInactive ? fallbackChallenges.slice() : fallbackChallenges.filter((challenge) => challenge.isActive !== false);
}

export function upsertFallbackUser(user: StoredUser) {
  const existing = fallbackUsers.get(user.uid) || { ...user, createdAt: new Date(), updatedAt: new Date() };
  const next = { ...existing, ...user, updatedAt: new Date() };
  fallbackUsers.set(user.uid, next);
  return next;
}

export function getFallbackUsers() {
  return Array.from(fallbackUsers.values());
}

export function createFallbackCompletion(input: Partial<StoredCompletion>) {
  const completion: StoredCompletion = {
    id: input.id || `completion-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    userId: input.userId || 'unknown',
    challengeId: input.challengeId || 'cleanup-neighbourhood',
    proofUrl: input.proofUrl,
    pointsAwarded: input.pointsAwarded || 0,
    aiVerificationStatus: input.aiVerificationStatus || 'PENDING',
    submittedAt: input.submittedAt || new Date(),
    createdAt: input.createdAt || new Date(),
    updatedAt: input.updatedAt || new Date(),
  };
  fallbackCompletions.push(completion);
  return completion;
}

export function getFallbackCompletions(userId?: string) {
  if (!userId) return fallbackCompletions.slice();
  return fallbackCompletions.filter((completion) => completion.userId === userId);
}

export function getFallbackImpactRows() {
  return getFallbackUsers().map((user) => {
    const userCompletions = getFallbackCompletions(user.uid);
    return {
      uid: user.uid,
      name: user.fullName || user.username || user.email,
      email: user.email,
      points: user.points || userCompletions.reduce((sum, completion) => sum + (completion.pointsAwarded || 0), 0),
      totalPoints: userCompletions.reduce((sum, completion) => sum + (completion.pointsAwarded || 0), 0),
      verifiedSubmissions: userCompletions.filter((completion) => completion.aiVerificationStatus === 'VERIFIED').length,
      pendingSubmissions: userCompletions.filter((completion) => completion.aiVerificationStatus === 'PENDING' || completion.aiVerificationStatus === 'MANUAL_REVIEW').length,
      challengesCompleted: userCompletions.length,
      lastActive: user.updatedAt,
      role: user.role,
    };
  });
}
