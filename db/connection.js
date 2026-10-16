const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';
  try {
    console.log(`Connecting to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully!');
    return true;
  } catch (err) {
    console.warn(`⚠️ MongoDB connection unavailable (${err.message}).`);
    console.log('⚡ SkillBridge is running in Resilience Mode: using internal persistent data store.');
    isConnected = false;
    return false;
  }
}

function getDbStatus() {
  return {
    connected: isConnected,
    type: isConnected ? 'MongoDB (Mongoose)' : 'Resilience Store (Active Fallback)'
  };
}

module.exports = { connectDB, getDbStatus };
