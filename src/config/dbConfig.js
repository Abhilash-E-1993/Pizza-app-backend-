const mongoose = require('mongoose');
const serverConfig = require('./serverConfig');

async function connectDB() {
  try {
    await mongoose.connect(serverConfig.DB_URL, {
      maxPoolSize: 10, // reuse pooled connections instead of opening one per query burst
      serverSelectionTimeoutMS: 5000, // fail fast instead of hanging requests
    });
    console.log('database connected');
  } catch (err) {
    console.error('database connection failed:', err.message);
    process.exit(1); // let the host (Render) restart the service cleanly
  }
}

module.exports = connectDB;