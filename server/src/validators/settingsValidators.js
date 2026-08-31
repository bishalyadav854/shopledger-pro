import { body } from 'express-validator';

export const settingsRules = [
  body('taxPercentDefault')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax percent must be between 0 and 100'),
  body('printerType')
    .optional()
    .isIn(['a4', 'thermal80mm'])
    .withMessage('Invalid printer type'),
];
