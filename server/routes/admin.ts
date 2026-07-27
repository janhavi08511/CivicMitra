import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.ts';
import { ChallengeModel } from '../models/Challenge.ts';
import { CompletionModel } from '../models/Completion.ts';
import { UserModel } from '../models/User.ts';
import { QuizQuestionModel } from '../models/Quiz.ts';
import { QuizAttemptModel } from '../models/QuizAttempt.ts';
import { EventModel } from '../models/Event.ts';
import { EventRegistrationModel } from '../models/EventRegistration.ts';
import { VerificationStatus } from '../../src/types.ts';
import { getFallbackImpactRows, getFallbackUsers } from '../services/fallbackStore.ts';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/admin/challenges', async (_req, res) => {
  const challenges = await ChallengeModel.find({}).sort({ createdAt: -1 }).lean();
  res.json(challenges);
});

router.get('/admin/quiz-questions', async (_req, res) => {
  const questions = await QuizQuestionModel.find({}).sort({ createdAt: -1 }).lean();
  res.json(questions);
});

router.get('/admin/overview', async (_req, res) => {
  try {
    const [users, completions, challenges, quizQuestions, quizAttempts, events, registrations] = await Promise.all([
      UserModel.countDocuments(),
      CompletionModel.countDocuments(),
      ChallengeModel.countDocuments(),
      QuizQuestionModel.countDocuments(),
      QuizAttemptModel.countDocuments(),
      EventModel.countDocuments(),
      EventRegistrationModel.countDocuments(),
    ]);

    res.json({
      users,
      completions,
      challenges,
      quizQuestions,
      quizAttempts,
      events,
      registrations,
    });
  } catch (error) {
    res.json({
      users: getFallbackUsers().length,
      completions: 0,
      challenges: 0,
      quizQuestions: 0,
      quizAttempts: 0,
      events: 0,
      registrations: 0,
    });
  }
});

router.get('/admin/completions', async (_req, res) => {
  const completions = await CompletionModel.find({}).sort({ submittedAt: -1 }).lean();
  res.json(completions);
});

router.patch('/admin/completions/:id', async (req, res) => {
  const { status } = req.body;
  const completion = await CompletionModel.findByIdAndUpdate(req.params.id, {
    aiVerificationStatus: status,
    verifiedAt: new Date(),
  }, { new: true });
  if (!completion) return res.status(404).json({ error: 'Completion not found' });
  res.json(completion);
});

router.get('/admin/users', async (_req, res) => {
  const users = await UserModel.find({}).sort({ createdAt: -1 }).lean();
  res.json(users);
});

router.post('/admin/challenges', async (req, res) => {
  const challenge = await ChallengeModel.create(req.body);
  res.status(201).json(challenge);
});

router.put('/admin/challenges/:id', async (req, res) => {
  const challenge = await ChallengeModel.findOneAndUpdate({ challengeId: req.params.id }, req.body, { new: true, upsert: true });
  res.json(challenge);
});

router.delete('/admin/challenges/:id', async (req, res) => {
  await ChallengeModel.deleteOne({ challengeId: req.params.id });
  res.status(204).send();
});

router.post('/admin/quiz-questions', async (req, res) => {
  const question = await QuizQuestionModel.create(req.body);
  res.status(201).json(question);
});

router.put('/admin/quiz-questions/:id', async (req, res) => {
  const question = await QuizQuestionModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(question);
});

router.delete('/admin/quiz-questions/:id', async (req, res) => {
  await QuizQuestionModel.deleteOne({ _id: req.params.id });
  res.status(204).send();
});

router.get('/admin/impact', async (_req, res) => {
  try {
    const users = await UserModel.find({}).lean();
    const completions = await CompletionModel.find({}).lean();
    const challenges = await ChallengeModel.find({}).lean();

    const challengeMap = new Map(challenges.map((c: any) => [c.challengeId, c]));

    const impactRows = users.map((user: any) => {
      const userCompletions = completions.filter((completion: any) => completion.userId === user.uid);
      const totalPoints = userCompletions.reduce((sum: number, completion: any) => sum + (completion.pointsAwarded || 0), 0);
      const verified = userCompletions.filter((completion: any) => completion.aiVerificationStatus === VerificationStatus.VERIFIED).length;
      const pending = userCompletions.filter((completion: any) => completion.aiVerificationStatus === VerificationStatus.PENDING || completion.aiVerificationStatus === VerificationStatus.MANUAL_REVIEW).length;
      return {
        uid: user.uid,
        name: user.fullName || user.username,
        email: user.email,
        points: user.points || totalPoints,
        totalPoints,
        verifiedSubmissions: verified,
        pendingSubmissions: pending,
        challengesCompleted: userCompletions.length,
        lastActive: user.lastActivityDate || user.updatedAt,
        role: user.role,
        impactBreakdown: userCompletions.map((completion: any) => ({
          challengeId: completion.challengeId,
          title: challengeMap.get(completion.challengeId)?.title || completion.challengeId,
          points: completion.pointsAwarded || 0,
          status: completion.aiVerificationStatus,
        })),
      };
    });

    res.json({
      summary: {
        totalUsers: users.length,
        totalCompletions: completions.length,
        verifiedCompletions: completions.filter((c: any) => c.aiVerificationStatus === VerificationStatus.VERIFIED).length,
        pendingCompletions: completions.filter((c: any) => c.aiVerificationStatus === VerificationStatus.PENDING || c.aiVerificationStatus === VerificationStatus.MANUAL_REVIEW).length,
      },
      users: impactRows,
    });
  } catch (error) {
    const fallbackRows = getFallbackImpactRows();
    res.json({
      summary: {
        totalUsers: fallbackRows.length,
        totalCompletions: fallbackRows.reduce((sum, row) => sum + row.challengesCompleted, 0),
        verifiedCompletions: fallbackRows.reduce((sum, row) => sum + row.verifiedSubmissions, 0),
        pendingCompletions: fallbackRows.reduce((sum, row) => sum + row.pendingSubmissions, 0),
      },
      users: fallbackRows,
    });
  }
});

export default router;
