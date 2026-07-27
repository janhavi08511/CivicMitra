import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { ChallengeModel } from '../models/Challenge.ts';
import { EventModel } from '../models/Event.ts';
import { CompletionModel } from '../models/Completion.ts';
import { QuizQuestionModel } from '../models/Quiz.ts';
import { QuizAttemptModel } from '../models/QuizAttempt.ts';
import { createFallbackCompletion, getFallbackChallenges, getFallbackCompletions, upsertFallbackUser } from '../services/fallbackStore.ts';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/challenges', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const filter: Record<string, unknown> = {};
    if (!includeInactive) {
      filter.isActive = true;
    }
    if (req.query.isDaily === 'true') {
      filter.isDaily = true;
    }
    const challenges = await ChallengeModel.find(filter).sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.json(getFallbackChallenges(req.query.includeInactive === 'true'));
  }
});

router.get('/events', async (_req, res) => {
  try {
    const events = await EventModel.find({}).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.json([]);
  }
});

router.get('/quiz-questions', async (req, res) => {
  try {
    const includeAll = req.query.all === 'true';
    const query = QuizQuestionModel.find({});
    if (!includeAll) {
      query.limit(10);
    }
    const questions = await query;
    res.json(questions);
  } catch (error) {
    res.json([]);
  }
});

router.get('/quiz_attempts', async (_req, res) => {
  try {
    const attempts = await QuizAttemptModel.find({}).sort({ submittedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.json([]);
  }
});

router.get('/completions', async (req, res) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const completions = await CompletionModel.find(filter).sort({ submittedAt: -1 });
    res.json(completions);
  } catch (error) {
    res.json([]);
  }
});

router.post('/completions', async (req, res) => {
  try {
    const { proofBase64, fileName, ...payload } = req.body;
    let proofUrl = payload.proofUrl || '';

    if (proofBase64) {
      const uploadDir = path.join(__dirname, '..', '..', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const ext = path.extname(fileName || 'upload.bin') || '.bin';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const filePath = path.join(uploadDir, filename);
      const buffer = Buffer.from(proofBase64, 'base64');
      await fs.writeFile(filePath, buffer);
      proofUrl = `/uploads/${filename}`;
    }

    try {
      const completion = await CompletionModel.create({ ...payload, proofUrl, proofType: payload.proofType || 'IMAGE' });
      res.status(201).json(completion);
      return;
    } catch (error) {
      const fallbackUser = upsertFallbackUser({ uid: payload.userId, email: payload.email || `${payload.userId}@fallback.local`, fullName: payload.fullName, username: payload.username, role: payload.role || 'user' });
      const completion = createFallbackCompletion({
        userId: fallbackUser.uid,
        challengeId: payload.challengeId,
        proofUrl,
        pointsAwarded: payload.pointsAwarded,
        aiVerificationStatus: payload.aiVerificationStatus || 'PENDING',
      });
      res.status(201).json(completion);
      return;
    }
  } catch (error) {
    console.error('Failed to create completion', error);
    res.status(500).json({ error: 'Failed to create completion' });
  }
});

router.get('/completions/:userId', async (req, res) => {
  try {
    const completions = await CompletionModel.find({ userId: req.params.userId }).sort({ submittedAt: -1 });
    res.json(completions);
  } catch (error) {
    res.json(getFallbackCompletions(req.params.userId));
  }
});

router.post('/quiz-attempts', async (req, res) => {
  try {
    const attempt = await QuizAttemptModel.create(req.body);
    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save quiz attempt' });
  }
});

export default router;
