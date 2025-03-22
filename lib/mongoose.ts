import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global as any;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

export async function connectToMongoose() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Connecting to MongoDB with Mongoose...');
    cached.mongoose.promise = mongoose.connect(MONGODB_URI as string, opts);
  }
  
  try {
    cached.mongoose.conn = await cached.mongoose.promise;
    console.log('Mongoose connection successful');
    return cached.mongoose.conn;
  } catch (e) {
    console.error('Mongoose connection error:', e);
    cached.mongoose.promise = null;
    throw e;
  }
}

export default connectToMongoose;
