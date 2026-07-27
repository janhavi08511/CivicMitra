import mongoose, { Schema, Document } from 'mongoose';

export interface IEventRegistration extends Document {
  id?: string;
  eventId: string;
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  teamName?: string;
  memberCount: string;
  registeredAt: Date;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventRegistrationSchema = new Schema<IEventRegistration>({
  eventId: { type: String, required: true, index: true },
  eventName: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  organization: { type: String, required: true },
  teamName: String,
  memberCount: { type: String, default: '1' },
  registeredAt: { type: Date, default: Date.now },
  userId: { type: String, index: true },
}, {
  timestamps: true,
});

export const EventRegistrationModel = mongoose.model<IEventRegistration>('EventRegistration', eventRegistrationSchema);
