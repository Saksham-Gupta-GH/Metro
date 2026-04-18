const express = require('express');
const DiscountCode = require('../models/DiscountCode');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const discounts = await DiscountCode.find().sort({ createdAt: -1 });
    return res.json({ discounts });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { code, type, value, maxUses, expiryDate } = req.body;

    if (!code || !type || !value || !maxUses || !expiryDate) {
      return res.status(400).json({ message: 'All discount fields are required.' });
    }

    const discount = await DiscountCode.create({
      code,
      type,
      value: Number(value),
      maxUses: Number(maxUses),
      expiryDate,
    });

    return res.status(201).json({ message: 'Discount code created successfully.', discount });
  } catch (error) {
    next(error);
  }
});

router.post('/:discountId/deactivate', requireAdmin, async (req, res, next) => {
  try {
    const discount = await DiscountCode.findById(req.params.discountId);

    if (!discount) {
      return res.status(404).json({ message: 'Discount code not found.' });
    }

    discount.isActive = false;
    await discount.save();

    return res.json({ message: 'Discount code deactivated.', discount });
  } catch (error) {
    next(error);
  }
});

router.delete('/:discountId', requireAdmin, async (req, res, next) => {
  try {
    await DiscountCode.findByIdAndDelete(req.params.discountId);
    return res.json({ message: 'Discount code deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
