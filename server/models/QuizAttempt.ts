import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAttempt extends Document {
  userId: string;
  date: string;
  score: number;
  answers: number[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  score: { type: Number, required: true },
  answers: [{ type: Number, required: true }],
  submittedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export const QuizAttemptModel = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
