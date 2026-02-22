import mongoose from "mongoose";

/**
 * Connect to MongoDB using Mongoose.
 *
 * - Uses process.env.MONGO_URI if provided
 * - Defaults to local MongoDB
 * - If Mongo isn't available, we return { connected:false } so the app can still run
 */
export async function connectMongo() {
  const uri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/northstar_lab5";

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    return { connected: true, uri };
  } catch (err) {
    console.warn(
      "[MongoDB] Not connected (running in File-Storage fallback).",
      err?.message || err
    );
    return { connected: false, uri, error: err };
  }
}
