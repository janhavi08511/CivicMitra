import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion extends Document {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
}, {
  timestamps: true,
});

export const QuizQuestionModel = mongoose.model<IQuizQuestion>('QuizQuestion', quizQuestionSchema);
