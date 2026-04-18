const DiscountCode = require('../models/DiscountCode');

function computeDiscountAmount(baseFare, discount) {
  if (!discount) {
    return 0;
  }

  if (discount.type === 'percentage') {
    return Number(((baseFare * discount.value) / 100).toFixed(2));
  }

  return Math.min(baseFare, Number(discount.value));
}

async function validateDiscountCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();

  if (!code) {
    return { discount: null, error: 'Discount code is required.' };
  }

  const discount = await DiscountCode.findOne({ code });

  if (!discount || !discount.isActive) {
    return { discount: null, error: 'Invalid or expired code.' };
  }

  if (discount.expiryDate < new Date()) {
    return { discount: null, error: 'Invalid or expired code.' };
  }

  if (discount.usedCount >= discount.maxUses) {
    return { discount: null, error: 'This discount code has reached its usage limit.' };
  }

  return { discount, error: null };
}

module.exports = {
  computeDiscountAmount,
  validateDiscountCode,
};
