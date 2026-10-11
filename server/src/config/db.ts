import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('MongoDB Atlas connected successfully.');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};
