const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = require('./app');

const port = process.env.PORT || 5002;

async function connectToMongo() {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI not found. Backend started without database connection.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.log('Backend is still running. Assistant routes can work, but auth and ticket booking need MongoDB.');
  }
}

function startServer() {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    connectToMongo();
  });
}

startServer();
