import mongoose from 'mongoose';
import env from './env.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

export default mongoose;
