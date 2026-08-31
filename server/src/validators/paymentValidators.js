import { body } from 'express-validator';

export const paymentRules = [
  body('invoice').isMongoId().withMessage('A valid invoice id is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('method')
    .optional()
    .isIn(['cash', 'card', 'upi', 'bank_transfer', 'other'])
    .withMessage('Invalid payment method'),
];
