import { body } from 'express-validator';

export const invoiceRules = [
  body('customer').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid customer id'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').optional().isMongoId().withMessage('Invalid product id'),
  body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('items.*.discount').optional().isFloat({ min: 0 }).withMessage('Discount must be non-negative'),
  body('taxPercent').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax percent must be between 0 and 100'),
  body('paidAmount').optional().isFloat({ min: 0 }).withMessage('Paid amount must be non-negative'),
];
