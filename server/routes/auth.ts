import { Router } from 'express';
import crypto from 'crypto';
import { UserModel } from '../models/User.ts';
import { Role } from '../../src/types.ts';
import { signToken } from '../middleware/auth.ts';
import { upsertFallbackUser } from '../services/fallbackStore.ts';

const router = Router();

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.get('/users', async (_req, res) => {
  try {
    const users = await UserModel.find({}).sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await UserModel.findOne({ uid: req.params.id }).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await UserModel.findOneAndUpdate(
      { uid: req.params.id },
      { ...req.body, uid: req.params.id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, username, city, country } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const uid = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = await UserModel.create({
      uid,
      username: username || email.split('@')[0],
      email,
      fullName: fullName || 'User',
      city: city || 'Unknown',
      country: country || 'Unknown',
      points: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      experiencePoints: 0,
      role: email === 'janhavi08511@gmail.com' ? Role.ADMIN : Role.USER,
      passwordHash: hashPassword(password),
    });

    const token = signToken({ uid: user.uid, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('auth/register failed', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await UserModel.findOne({ email });
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ uid: user.uid, email: user.email, role: user.role });
    res.json({ user, token });
  } catch (error) {
    console.error('auth/login failed', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/auth/profile', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, role } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: 'uid and email are required' });
    }

    let user: any;
    try {
      user = await UserModel.findOne({ uid });
      if (!user) {
        const username = email.split('@')[0] || `user_${uid.slice(0, 5)}`;
        user = await UserModel.create({
          uid,
          username,
          email,
          fullName: displayName || 'User',
          avatarUrl: photoURL,
          city: 'Unknown',
          country: 'Unknown',
          points: 0,
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 1,
          experiencePoints: 0,
          role: role || (email === 'janhavi08511@gmail.com' ? Role.ADMIN : Role.USER),
        });
      } else if (role) {
        user.role = role;
        await user.save();
      }
    } catch (error) {
      user = upsertFallbackUser({
        uid,
        email,
        fullName: displayName || 'User',
        username: email.split('@')[0] || `user_${uid.slice(0, 5)}`,
        role: role || (email === 'janhavi08511@gmail.com' ? Role.ADMIN : Role.USER),
      });
    }

    const token = signToken({ uid: user.uid, email: user.email, role: user.role });
    res.json({ user, token });
  } catch (error) {
    console.error('auth/profile failed', error);
    res.status(500).json({ error: 'Failed to sync profile' });
  }
});

export default router;
