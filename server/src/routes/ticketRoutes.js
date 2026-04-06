const express = require('express');
const Ticket = require('../models/Ticket');
const { metroLines } = require('../data/metroData');
const { calculateFare } = require('../utils/fare');

const router = express.Router();

router.get('/meta', (req, res) => {
  res.json({ metroLines });
});

router.post('/', async (req, res, next) => {
  try {
    const { passenger, email, line, from, to, quantity } = req.body;

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

    const { stops, farePerTicket, totalFare } = calculateFare(line, from, to, quantity);
    const ticketId = `MT-${Date.now().toString(36).toUpperCase()}`;

    const ticket = await Ticket.create({
      ticketId,
      passenger,
      email,
      line,
      from,
      to,
      quantity: Number(quantity),
      stops,
      farePerTicket,
      totalFare,
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
        time: ticket.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
