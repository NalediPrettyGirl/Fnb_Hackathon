const mongoose = require('mongoose');

/** Connect once before the HTTP server starts accepting requests. */
async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('MONGODB_URI is required. Configure it in your .env file.');
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

module.exports = connectDatabase;
