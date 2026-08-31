import { body } from 'express-validator';

export const customerRules = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required'),
];
