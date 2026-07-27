import { Router } from 'express';
import { EventModel } from '../models/Event.ts';
import { EventRegistrationModel } from '../models/EventRegistration.ts';
import { EventParticipantModel } from '../models/EventParticipant.ts';

const router = Router();

router.get('/events', async (_req, res) => {
  const events = await EventModel.find({}).sort({ createdAt: -1 });
  res.json(events);
});

router.post('/events/register', async (req, res) => {
  try {
    const registration = await EventRegistrationModel.create(req.body);
    const { email, phone, ...publicData } = req.body;
    await EventParticipantModel.create({
      ...publicData,
      registeredAt: registration.registeredAt,
    });
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

router.get('/events/registrations/:eventId', async (req, res) => {
  const regs = await EventRegistrationModel.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
  res.json(regs);
});

router.get('/events/participants', async (_req, res) => {
  const participants = await EventParticipantModel.find({}).sort({ createdAt: -1 });
  res.json(participants);
});

router.get('/event_registrations', async (_req, res) => {
  const registrations = await EventRegistrationModel.find({}).sort({ createdAt: -1 });
  res.json(registrations);
});

router.get('/event_participants_public', async (_req, res) => {
  const participants = await EventParticipantModel.find({}).sort({ createdAt: -1 });
  res.json(participants);
});

export default router;
