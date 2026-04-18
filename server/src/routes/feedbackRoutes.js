const express = require('express');
const Feedback = require('../models/Feedback');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { type, relatedTo, subject, description, rating, screenshotName } = req.body;

    if (!type || !relatedTo || !subject || !description || description.trim().length < 20) {
      return res.status(400).json({ message: 'Please complete the feedback form properly.' });
    }

    const feedback = await Feedback.create({
      userId: req.currentUser._id,
      userName: req.currentUser.fullName || req.currentUser.username,
      email: req.currentUser.email,
      type,
      relatedTo,
      subject,
      description,
      rating: Number(rating || 5),
      screenshotName: screenshotName || '',
    });

    return res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
  } catch (error) {
    next(error);
  }
});

router.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const query = {};

    if (type && type !== 'All') {
      query.type = type;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const feedback = await Feedback.find(query).sort({ createdAt: -1 });
    return res.json({ feedback });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/:feedbackId/resolve', requireAdmin, async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback item not found.' });
    }

    feedback.status = 'Resolved';
    await feedback.save();
    return res.json({ message: 'Feedback marked as resolved.', feedback });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
