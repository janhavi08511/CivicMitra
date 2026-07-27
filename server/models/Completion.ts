import mongoose, { Schema, Document } from 'mongoose';
import { VerificationStatus } from '../../src/types.ts';

export interface ICompletion extends Document {
  userId: string;
  challengeId: string;
  proofUrl: string;
  proofType: 'IMAGE' | 'VIDEO';
  caption?: string;
  aiVerificationStatus: VerificationStatus;
  aiVerificationScore: number;
  pointsAwarded: number;
  isStreakDay: boolean;
  submittedAt: Date;
  verifiedAt?: Date;
  likesCount?: number;
  commentsCount?: number;
  impactData?: Record<string, unknown>;
  fraudScore?: Record<string, unknown>;
  fraudReviewStatus?: 'pending' | 'approved' | 'rejected';
  fraudReviewId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const completionSchema = new Schema<ICompletion>({
  userId: { type: String, required: true, index: true },
  challengeId: { type: String, required: true, index: true },
  proofUrl: { type: String, required: true },
  proofType: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
  caption: String,
  aiVerificationStatus: { type: String, enum: Object.values(VerificationStatus), default: VerificationStatus.PENDING },
  aiVerificationScore: { type: Number, default: 0 },
  pointsAwarded: { type: Number, default: 0 },
  isStreakDay: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: Date,
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  impactData: { type: Schema.Types.Mixed },
  fraudScore: { type: Schema.Types.Mixed },
  fraudReviewStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  fraudReviewId: String,
}, {
  timestamps: true,
});

export const CompletionModel = mongoose.model<ICompletion>('Completion', completionSchema);
