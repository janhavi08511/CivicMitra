import mongoose, { Schema, Document } from 'mongoose';

export interface IEventParticipant extends Document {
  id?: string;
  eventId: string;
  eventName: string;
  fullName: string;
  organization: string;
  teamName?: string;
  memberCount: string;
  registeredAt: Date;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventParticipantSchema = new Schema<IEventParticipant>({
  eventId: { type: String, required: true, index: true },
  eventName: { type: String, required: true },
  fullName: { type: String, required: true },
  organization: { type: String, required: true },
  teamName: String,
  memberCount: { type: String, default: '1' },
  registeredAt: { type: Date, default: Date.now },
  userId: { type: String, index: true },
}, {
  timestamps: true,
});

export const EventParticipantModel = mongoose.model<IEventParticipant>('EventParticipant', eventParticipantSchema);
