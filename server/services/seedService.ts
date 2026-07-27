import { ChallengeModel } from '../models/Challenge.ts';
import { EventModel } from '../models/Event.ts';
import { QuizQuestionModel } from '../models/Quiz.ts';
import { Category, Difficulty } from '../../src/types.ts';

export async function seedStarterData() {
  const challengeCount = await ChallengeModel.countDocuments();
  if (challengeCount === 0) {
    await ChallengeModel.create([
      {
        challengeId: 'cleanup-neighbourhood',
        title: 'Clean the neighbourhood',
        description: 'Pick up litter in your local area and share proof.',
        shortDescription: 'Community cleanup',
        category: Category.COMMUNITY,
        difficulty: Difficulty.EASY,
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
        category: Category.TRANSPORT,
        difficulty: Difficulty.MEDIUM,
        points: 180,
        bonusPointsStreak: 30,
        iconEmoji: '🚲',
        bannerImageUrl: '',
        proofInstructions: 'Share a photo or short note.',
        isDaily: false,
        isActive: true,
      },
    ]);
  }

  const eventCount = await EventModel.countDocuments();
  if (eventCount === 0) {
    await EventModel.create({
      eventId: 'city-tree-planting',
      title: 'City Tree Planting Drive',
      description: 'Join the neighbourhood tree planting effort.',
      location: 'Central Park',
      date: '2026-08-10',
      organizer: 'CivicMitra',
      participantsCount: 0,
    });
  }

  const quizCount = await QuizQuestionModel.countDocuments();
  if (quizCount === 0) {
    await QuizQuestionModel.create([
      {
        question: 'What is the main benefit of reducing plastic usage?',
        options: ['Higher energy bills', 'Less landfill waste', 'More traffic', 'More noise'],
        correctAnswer: 1,
        difficulty: 'easy',
      },
      {
        question: 'Which action saves the most energy?',
        options: ['Leaving lights on', 'Using public transit', 'Keeping appliances running', 'Driving alone'],
        correctAnswer: 1,
        difficulty: 'medium',
      },
    ]);
  }
}
