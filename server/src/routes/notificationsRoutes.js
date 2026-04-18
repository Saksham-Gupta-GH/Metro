const express = require('express');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const DiscountCode = require('../models/DiscountCode');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const notificationsLastReadAt = req.currentUser.notificationsLastReadAt || new Date(0);
    const directNotifications = await Notification.find({ userId: req.currentUser._id }).sort({ createdAt: -1 });
    const now = new Date();
    const announcements = await Announcement.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).sort({ createdAt: -1 });
    const discounts = await DiscountCode.find({
      isActive: true,
      expiryDate: { $gte: now },
    }).sort({ createdAt: -1 });

    const syntheticAnnouncements = announcements.map((item) => ({
      _id: `announcement-${item._id}`,
      type: 'service_disruption',
      title: item.title,
      description: item.description,
      createdAt: item.createdAt,
      meta: {
        severity: item.severity,
        lines: item.lines,
      },
    }));

    const syntheticDiscounts = discounts.slice(0, 5).map((item) => ({
      _id: `discount-${item._id}`,
      type: 'promotion',
      title: `Offer available: ${item.code}`,
      description: `${item.type === 'percentage' ? `${item.value}% off` : `₹${item.value} off`} until ${new Date(item.expiryDate).toLocaleDateString()}.`,
      createdAt: item.createdAt,
      meta: {
        code: item.code,
      },
    }));

    const notifications = [...directNotifications, ...syntheticAnnouncements, ...syntheticDiscounts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((item) => ({
        ...item.toObject?.() || item,
        read: new Date(item.createdAt) <= notificationsLastReadAt,
      }));

    const unreadCount = notifications.filter((item) => !item.read).length;
    return res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

router.post('/mark-all-read', requireAuth, async (req, res, next) => {
  try {
    req.currentUser.notificationsLastReadAt = new Date();
    await req.currentUser.save();
    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
