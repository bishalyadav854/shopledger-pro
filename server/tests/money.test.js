import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateInvoiceTotals } from '../src/utils/money.js';

test('calculates invoice totals with tax and discount', () => {
  const result = calculateInvoiceTotals({ items: [{ name: 'Tea', quantity: 2, price: 10, discount: 2 }], taxPercent: 5 });
  assert.equal(result.subtotal, 20);
  assert.equal(result.discountTotal, 2);
  assert.equal(result.taxAmount, 0.9);
  assert.equal(result.grandTotal, 18.9);
});

test('rejects zero or negative quantities', () => {
  assert.throws(() => calculateInvoiceTotals({ items: [{ quantity: 0, price: 10 }] }), /quantity/);
});

test('rejects discount greater than line amount', () => {
  assert.throws(() => calculateInvoiceTotals({ items: [{ quantity: 1, price: 10, discount: 11 }] }), /discount/);
});
