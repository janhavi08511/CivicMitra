import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI?.trim();

export async function connectDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Set MONGODB_URI to your MongoDB Atlas connection string.');
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);

  return mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority',
  });
}
