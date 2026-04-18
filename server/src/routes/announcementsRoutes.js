const express = require('express');
const Announcement = require('../models/Announcement');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).sort({ startTime: -1 });

    return res.json({ announcements });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { lines, title, description, severity, startTime, endTime } = req.body;

    if (!lines?.length || !title || !description || !severity || !startTime || !endTime) {
      return res.status(400).json({ message: 'All announcement fields are required.' });
    }

    const announcement = await Announcement.create({
      lines,
      title,
      description,
      severity,
      startTime,
      endTime,
    });

    return res.status(201).json({ message: 'Announcement created successfully.', announcement });
  } catch (error) {
    next(error);
  }
});

router.delete('/:announcementId', requireAdmin, async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.announcementId);
    return res.json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
