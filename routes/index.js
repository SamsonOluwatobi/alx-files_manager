/**
 * Routes Module
 * --------------
 * This module defines all API endpoints and maps them to their respective
 * controller functions.
 */

import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const router = Router();

// Route definitions
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// Authentication Routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

export default router;
