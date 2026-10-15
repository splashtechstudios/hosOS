import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://splashtechstudios_db_user:tihVPfWmCW2gkE5N@cluster0.8nmwbry.mongodb.net/hosos?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseGlobal: GlobalMongoose | undefined;
}

let cached: GlobalMongoose = global.mongooseGlobal || { conn: null, promise: null };

if (!global.mongooseGlobal) {
  global.mongooseGlobal = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('Connected to MongoDB Atlas: hosos database');
      return m;
    }).catch(err => {
      console.error('Failed to connect to MongoDB Atlas:', err);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
