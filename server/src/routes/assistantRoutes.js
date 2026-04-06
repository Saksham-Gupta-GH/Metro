const express = require('express');
const { getAssistantReply } = require('../services/assistantService');

const router = express.Router();

router.post('/chat', async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const response = await getAssistantReply(message, process.env.GEMINI_API_KEY);
    return res.json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
