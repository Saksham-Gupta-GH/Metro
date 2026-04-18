const { calculateFare } = require('../server/src/utils/fare');
const { computeDiscountAmount } = require('../server/src/utils/discounts');

// Mock discount code
const mockDiscount = {
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    isActive: true,
    maxUses: 100,
    usedCount: 0,
    expiryDate: new Date('2026-12-31')
};

// Mock journey
const line = 'Purple Line';
const from = 'Whitefield';
const to = 'Majestic';
const quantity = 2;

const fareData = calculateFare(line, from, to, quantity);
const discountAmount = computeDiscountAmount(fareData.totalFare, mockDiscount);
const finalFare = Number(Math.max(0, fareData.totalFare - discountAmount).toFixed(2));

console.log('Fare Calculation Test:');
console.log('Line:', line);
console.log('From:', from, 'To:', to);
console.log('Quantity:', quantity);
console.log('Total Base Fare:', fareData.totalFare);
console.log('Discount Applied:', mockDiscount.code, `(${mockDiscount.value}%)`);
console.log('Discount Amount:', discountAmount);
console.log('Final Fare:', finalFare);

if (finalFare === fareData.totalFare * 0.9) {
    console.log('\nSUCCESS: Discount calculation is correct.');
} else {
    console.log('\nFAILURE: Discount calculation mismatch.');
}
