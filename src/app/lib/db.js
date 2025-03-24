import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://sarthak:sarthak@cluster0.cwdj5.mongodb.net/mindease";

if (!MONGO_URL) {
  throw new Error('MONGO_URL is not set');
}

const globalAny = globalThis;

if (!globalAny.mongoose) {
  globalAny.mongoose = { conn: null, promise: null };
}

let cached = globalAny.mongoose;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGO_URL, opts)
      .then((m) => {
        console.log('Connected to database');
        return m;
      })
      .catch((error) => {
        console.error('Error connecting to database:', error);
        throw new Error('Database connection failed');
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

connectToDatabase();