const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function serializeUser(user, totalBookings = 0) {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    fullName: user.fullName || user.username,
    role: user.role,
    adminRequestStatus: user.adminRequestStatus,
    status: user.status,
    phoneNumber: user.phoneNumber || '',
    photoUrl: user.photoUrl || '',
    paymentMethods: user.paymentMethods || [],
    joinedAt: user.createdAt,
    totalBookings,
  };
}

router.post('/signup', async (req, res, next) => {
  try {
    const { email, username, password, role } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    const adminCount = await User.countDocuments({ role: 'admin' });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists. Please log in.' });
    }

    const requestedAdmin = role === 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);
    const shouldBootstrapAdmin = requestedAdmin && adminCount === 0;

    const user = await User.create({
      email: normalizedEmail,
      username,
      fullName: username,
      password: hashedPassword,
      role: shouldBootstrapAdmin ? 'admin' : 'user',
      adminRequestStatus: shouldBootstrapAdmin ? 'approved' : requestedAdmin ? 'pending' : 'none',
    });

    return res.status(201).json({
      message: shouldBootstrapAdmin
        ? 'Signup successful. You became the first admin automatically.'
        : requestedAdmin
        ? 'Signup successful. Your admin access request has been sent for approval.'
        : 'Signup successful.',
      user: serializeUser(user, 0),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account is banned.' });
    }

    let passwordMatches = false;

    if (user.password.startsWith('$2')) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      passwordMatches = user.password === password;

      if (passwordMatches) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const totalBookings = await Ticket.countDocuments({ email: user.email });

    return res.json({
      message: 'Login successful.',
      user: serializeUser(user, totalBookings),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const totalBookings = await Ticket.countDocuments({ email: req.currentUser.email });
    return res.json({ user: serializeUser(req.currentUser, totalBookings) });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, photoUrl } = req.body;
    const normalizedEmail = String(email || '').toLowerCase();

    if (!fullName || !normalizedEmail) {
      return res.status(400).json({ message: 'Full name and email are required.' });
    }

    const emailOwner = await User.findOne({ email: normalizedEmail, _id: { $ne: req.currentUser._id } });
    if (emailOwner) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }

    req.currentUser.fullName = fullName;
    req.currentUser.username = fullName;
    req.currentUser.email = normalizedEmail;
    req.currentUser.phoneNumber = phoneNumber || '';
    req.currentUser.photoUrl = photoUrl || '';
    await req.currentUser.save();

    await Ticket.updateMany(
      { userId: req.currentUser._id },
      { $set: { email: req.currentUser.email, passenger: req.currentUser.fullName } }
    );

    const totalBookings = await Ticket.countDocuments({ email: req.currentUser.email });
    return res.json({
      message: 'Profile updated successfully.',
      user: serializeUser(req.currentUser, totalBookings),
    });
  } catch (error) {
    next(error);
  }
});

router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required.' });
    }

    if (req.currentUser.password !== currentPassword) {
      const matches = req.currentUser.password.startsWith('$2')
        ? await bcrypt.compare(currentPassword, req.currentUser.password)
        : req.currentUser.password === currentPassword;

      if (!matches) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    req.currentUser.password = await bcrypt.hash(newPassword, 10);
    await req.currentUser.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/payment-methods', requireAuth, async (req, res, next) => {
  try {
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ message: 'Payment method is required.' });
    }

    req.currentUser.paymentMethods.push({
      label: value,
      value,
      type: value.includes('@') ? 'UPI' : 'Card',
    });
    await req.currentUser.save();

    return res.status(201).json({
      message: 'Payment method saved.',
      paymentMethods: req.currentUser.paymentMethods,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/payment-methods/:methodId', requireAuth, async (req, res, next) => {
  try {
    req.currentUser.paymentMethods = req.currentUser.paymentMethods.filter(
      (method) => String(method._id) !== req.params.methodId
    );
    await req.currentUser.save();

    return res.json({
      message: 'Payment method deleted.',
      paymentMethods: req.currentUser.paymentMethods,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
