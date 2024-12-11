/**
 * Routes Module
 * --------------
 * This module defines all API endpoints and maps them to their respective
 * controller functions.
 */

import { Router } from 'express';
import AppController from '../controllers/AppController';

const router = Router();

// Route definitions
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;
