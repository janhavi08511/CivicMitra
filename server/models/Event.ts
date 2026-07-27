import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  eventId: string;
  title: string;
  description: string;
  location: string;
  date: string;
  organizer: string;
  maxParticipants?: number;
  participantsCount?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
  eventId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  organizer: { type: String, required: true },
  maxParticipants: Number,
  participantsCount: { type: Number, default: 0 },
  imageUrl: String,
}, {
  timestamps: true,
});

export const EventModel = mongoose.model<IEvent>('Event', eventSchema);
