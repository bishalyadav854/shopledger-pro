import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { settingsRules } from '../validators/settingsValidators.js';
import { validate } from '../validators/authValidators.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(settingsController.getSettings)
  .put(settingsRules, validate, settingsController.updateSettings);

export default router;
