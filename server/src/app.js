const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const assistantRoutes = require('./routes/assistantRoutes');

mongoose.set('bufferCommands', false);

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/assistant', assistantRoutes);

app.use((req, res, next) => {
  const databaseRequiredRoutes = ['/api/auth', '/api/tickets'];

  if (
    databaseRequiredRoutes.some((route) => req.path.startsWith(route)) &&
    mongoose.connection.readyState !== 1
  ) {
    return res.status(503).json({
      message: 'Database not connected. Add MONGODB_URI to server/.env and restart the backend.',
    });
  }

  return next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || 'Internal server error.',
  });
});

module.exports = app;
