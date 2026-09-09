const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB (Atlas or local URI)
    const conn = await mongoose.connect(mongoURI);

    const isAtlas = conn.connection.host.includes('mongodb.net') || conn.connection.host.includes('cluster');
    console.log(`[MongoDB] Connected to ${isAtlas ? 'MongoDB Atlas' : 'Database'}: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
