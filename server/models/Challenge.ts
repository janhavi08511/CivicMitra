import mongoose, { Schema, Document } from 'mongoose';
import { Category, Difficulty } from '../../src/types.ts';

export interface IChallenge extends Document {
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
  impactCalculation?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const challengeSchema = new Schema<IChallenge>({
  challengeId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  category: { type: String, enum: Object.values(Category), required: true },
  difficulty: { type: String, enum: Object.values(Difficulty), required: true },
  points: { type: Number, required: true, default: 0 },
  bonusPointsStreak: { type: Number, default: 0 },
  iconEmoji: String,
  bannerImageUrl: String,
  proofInstructions: String,
  isDaily: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  impactCalculation: { type: Schema.Types.Mixed },
}, {
  timestamps: true,
});

export const ChallengeModel = mongoose.model<IChallenge>('Challenge', challengeSchema);
