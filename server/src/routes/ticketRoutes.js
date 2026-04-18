const express = require('express');
const Ticket = require('../models/Ticket');
const { metroLines } = require('../data/metroData');
const { calculateFare } = require('../utils/fare');
const { computeDiscountAmount, validateDiscountCode } = require('../utils/discounts');
const { requireAuth } = require('../middleware/auth');
const { createUserNotification } = require('../utils/notifications');

const router = express.Router();

router.get('/meta', (req, res) => {
  res.json({ metroLines });
});

router.post('/discounts/validate', requireAuth, async (req, res, next) => {
  try {
    const { code, line, from, to, quantity } = req.body;

    if (!line || !from || !to || !quantity) {
      return res.status(400).json({ message: 'Journey details are required to validate a code.' });
    }

    const fareData = calculateFare(line, from, to, quantity);
    const { discount, error } = await validateDiscountCode(code);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const discountAmount = computeDiscountAmount(fareData.totalFare, discount);
    const finalFare = Number(Math.max(0, fareData.totalFare - discountAmount).toFixed(2));

    return res.json({
      message: 'Discount code applied successfully.',
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
        originalFare: fareData.totalFare,
        finalFare,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ userId: req.currentUser._id }).sort({ createdAt: -1 });
    return res.json({ tickets });
  } catch (error) {
    next(error);
  }
});

router.post('/:ticketId/cancel', requireAuth, async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId, userId: req.currentUser._id });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (ticket.status === 'Cancelled') {
      return res.status(400).json({ message: 'Ticket is already cancelled.' });
    }

    ticket.status = 'Cancelled';
    ticket.cancelledAt = new Date();
    await ticket.save();

    await createUserNotification(req.currentUser, {
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      description: `${ticket.from} to ${ticket.to} has been cancelled.`,
      meta: { ticketId: ticket.ticketId, route: `${ticket.from} → ${ticket.to}` },
    });

    return res.json({ message: 'Ticket cancelled successfully.', ticket });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { passenger, line, from, to, quantity, discountCode } = req.body;

    if (!passenger || !line || !from || !to || !quantity) {
      return res.status(400).json({ message: 'Passenger, line, source, destination, and quantity are required.' });
    }

    if (from === to) {
      return res.status(400).json({ message: 'Source and destination cannot be the same.' });
    }

    const stations = metroLines[line];
    if (!stations || !stations.includes(from) || !stations.includes(to)) {
      return res.status(400).json({ message: 'Invalid line or station selection.' });
    }

    const fareData = calculateFare(line, from, to, quantity);
    let discount = null;
    let discountAmount = 0;
    let finalFare = fareData.totalFare;

    if (discountCode) {
      const result = await validateDiscountCode(discountCode);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }

      discount = result.discount;
      discountAmount = computeDiscountAmount(fareData.totalFare, discount);
      finalFare = Number(Math.max(0, fareData.totalFare - discountAmount).toFixed(2));
      discount.usedCount += 1;
      await discount.save();
    }

    const ticketId = `MT-${Date.now().toString(36).toUpperCase()}`;
    const ticket = await Ticket.create({
      userId: req.currentUser._id,
      ticketId,
      passenger,
      email: req.currentUser.email,
      line,
      from,
      to,
      quantity: Number(quantity),
      stops: fareData.stops,
      farePerTicket: fareData.farePerTicket,
      totalFare: finalFare,
      originalFare: fareData.totalFare,
      discountAmount,
      discountCode: discount ? discount.code : '',
      status: 'Confirmed',
    });

    await createUserNotification(req.currentUser, {
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      description: `${from} to ${to} has been confirmed.`,
      meta: { ticketId, route: `${from} → ${to}`, line, fare: finalFare },
    });

    return res.status(201).json({
      message: 'Ticket booked successfully.',
      ticket: {
        id: ticket.ticketId,
        passenger: ticket.passenger,
        email: ticket.email,
        line: ticket.line,
        from: ticket.from,
        to: ticket.to,
        quantity: ticket.quantity,
        stops: ticket.stops,
        farePerTicket: ticket.farePerTicket,
        fare: ticket.totalFare,
        originalFare: ticket.originalFare,
        discountAmount: ticket.discountAmount,
        discountCode: ticket.discountCode,
        status: ticket.status,
        time: ticket.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
