import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../../src/types.ts';

export interface IUser extends Document {
  uid: string;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  country?: string;
  totalPoints: number;
  points: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experiencePoints: number;
  role: Role;
  passwordHash?: string;
  lastActivityDate?: string;
  createdAt: Date;
  updatedAt: Date;
  fcmToken?: string;
}

const userSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  fullName: String,
  avatarUrl: String,
  bio: String,
  city: String,
  country: String,
  totalPoints: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experiencePoints: { type: Number, default: 0 },
  role: { type: String, enum: Object.values(Role), default: Role.USER },
  passwordHash: String,
  lastActivityDate: String,
  fcmToken: String,
}, {
  timestamps: true,
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
