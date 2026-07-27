import test from 'node:test';
import assert from 'node:assert/strict';
import { createFallbackCompletion, getFallbackChallenges, upsertFallbackUser } from '../services/fallbackStore.ts';

test('fallback store returns seeded challenges and persists a completion', async () => {
  const challenges = getFallbackChallenges(true);
  assert.ok(challenges.length > 0);

  const user = upsertFallbackUser({
    uid: 'fallback-user',
    email: 'fallback@example.com',
    displayName: 'Fallback User',
    role: 'user',
  });

  const completion = createFallbackCompletion({
    userId: user.uid,
    challengeId: challenges[0].challengeId,
    proofUrl: '/uploads/test.png',
    pointsAwarded: 120,
    aiVerificationStatus: 'VERIFIED',
  });

  assert.equal(completion.userId, 'fallback-user');
  assert.equal(completion.challengeId, challenges[0].challengeId);
  assert.equal(completion.pointsAwarded, 120);
});
