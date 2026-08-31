import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/sales', reportController.salesSummary);
router.get('/customer-dues', reportController.customerDues);
router.get('/top-products', reportController.topProducts);
router.get('/collections', reportController.collectionReport);

export default router;
