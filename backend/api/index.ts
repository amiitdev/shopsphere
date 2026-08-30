import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopsphere";

let cached = (global as any).__mongooseConn;
if (!cached) cached = (global as any).__mongooseConn = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const mod = await import("./app.mjs");
const app = mod.createApp();

// Connect to MongoDB on cold start
await connectDB();

export default app;
