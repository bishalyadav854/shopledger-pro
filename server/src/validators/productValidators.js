import { body } from 'express-validator';

export const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a non-negative number'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be non-negative'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer'),
];
