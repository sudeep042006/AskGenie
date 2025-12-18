import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables early so MONGODB_URI (if present) is available
dotenv.config();

// src/config/mongoClient.js (ES module - works with "type": "module" in package.json)

// Prefer a declared URI environment variable, but fall back to localhost for
// convenience during development.
const uri =  process.env.MONGODB_URI;

try {
    // Ensure we await the connection so callers import after the connection is ready
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected');
} catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    // Exit so the application doesn't continue running in a bad state
    process.exit(1);
}

export default mongoose;