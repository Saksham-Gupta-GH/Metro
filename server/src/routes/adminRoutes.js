const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAdmin);

router.get('/dashboard', async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const todayTickets = await Ticket.find({ createdAt: { $gte: startOfDay, $lt: endOfDay } }).sort({ createdAt: -1 });
    const totalRevenue = todayTickets
      .filter((ticket) => ticket.status === 'Confirmed')
      .reduce((sum, ticket) => sum + ticket.totalFare, 0);
    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      bookings: 0,
    }));

    todayTickets.forEach((ticket) => {
      hourly[new Date(ticket.createdAt).getHours()].bookings += 1;
    });

    const hour = now.getHours();
    const peakHourAlert = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20);

    return res.json({
      stats: {
        totalTicketsBookedToday: todayTickets.length,
        totalRevenueToday: Number(totalRevenue.toFixed(2)),
        activeTrainsRightNow: 18,
        peakHourAlert,
      },
      chart: hourly,
      recentBookings: todayTickets.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/admin-requests/count', async (req, res, next) => {
  try {
    const count = await User.countDocuments({ adminRequestStatus: 'pending' });
    return res.json({ count });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', async (req, res, next) => {
  try {
    const { date, line, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (date) {
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.createdAt = { $gte: selectedDate, $lt: nextDate };
    }

    if (line) {
      query.line = line;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { passenger: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const total = await Ticket.countDocuments(query);
    const bookings = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.json({
      bookings,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/bookings/:ticketId/cancel', async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });

    if (!ticket) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    ticket.status = 'Cancelled';
    ticket.cancelledAt = new Date();
    await ticket.save();

    return res.json({ message: 'Booking cancelled successfully.', booking: ticket });
  } catch (error) {
    next(error);
  }
});

router.put('/bookings/:ticketId', async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });

    if (!ticket) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const { passenger, line, from, to, quantity, status } = req.body;

    if (!passenger || !line || !from || !to || !quantity) {
      return res.status(400).json({ message: 'Passenger, line, route, and quantity are required.' });
    }

    const { calculateFare } = require('../utils/fare');
    const { metroLines } = require('../data/metroData');
    const stations = metroLines[line];

    if (!stations || !stations.includes(from) || !stations.includes(to)) {
      return res.status(400).json({ message: 'Invalid line or station selection.' });
    }

    const fareData = calculateFare(line, from, to, quantity);

    ticket.passenger = passenger;
    ticket.line = line;
    ticket.from = from;
    ticket.to = to;
    ticket.quantity = Number(quantity);
    ticket.stops = fareData.stops;
    ticket.farePerTicket = fareData.farePerTicket;
    ticket.totalFare = fareData.totalFare;
    ticket.originalFare = fareData.totalFare;
    ticket.discountAmount = 0;
    ticket.discountCode = '';
    ticket.status = status || ticket.status;

    if (ticket.status !== 'Cancelled') {
      ticket.cancelledAt = null;
    }

    await ticket.save();

    return res.json({ message: 'Booking updated successfully.', booking: ticket });
  } catch (error) {
    next(error);
  }
});

router.delete('/bookings/:ticketId', async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });

    if (!ticket) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    await ticket.deleteOne();
    return res.json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    const pendingAdminRequests = await User.find({ adminRequestStatus: 'pending' }).sort({ createdAt: -1 });
    const bookings = await Ticket.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]);
    const bookingMap = bookings.reduce((acc, item) => {
      acc[String(item._id)] = item.count;
      return acc;
    }, {});

    return res.json({
      users: users.map((user) => ({
        ...user.toObject(),
        totalBookings: bookingMap[String(user._id)] || 0,
      })),
      pendingAdminRequests: pendingAdminRequests.map((user) => ({
        ...user.toObject(),
        totalBookings: bookingMap[String(user._id)] || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:userId/approve-admin', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = 'admin';
    user.adminRequestStatus = 'approved';
    await user.save();

    return res.json({ message: 'Admin access approved successfully.', user });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:userId/reject-admin', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = 'user';
    user.adminRequestStatus = 'rejected';
    await user.save();

    return res.json({ message: 'Admin access request rejected.', user });
  } catch (error) {
    next(error);
  }
});

router.get('/users/:userId', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const bookings = await Ticket.find({ userId: user._id }).sort({ createdAt: -1 });
    return res.json({ user, bookings });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:userId/toggle-ban', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.status = user.status === 'active' ? 'banned' : 'active';
    await user.save();

    return res.json({ message: `User ${user.status === 'active' ? 'unbanned' : 'banned'} successfully.`, user });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:userId', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await Ticket.deleteMany({ userId: user._id });
    await user.deleteOne();

    return res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
