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
import FilesController from '../controllers/FilesController.js';
import { basicAuthenticate, xTokenAuthenticate } from '../middlewares/auth';
import { APIError, errorResponse } from '../middlewares/errorHandler';


const injectRoutes = (api) => {

    // Route definitions
    api.get('/status', AppController.getStatus);
    api.get('/stats', AppController.getStats);
    api.post('/users', UsersController.postNew);
    api.get('/users/me', xTokenAuthenticate, UsersController.getMe);

    // Authentication Routes
    api.get('/connect', basicAuthenticate, AuthController.getConnect);
    api.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);

    api.post('/files', xTokenAuthenticate, FilesController.postUpload);
    api.get('/files/:id', xTokenAuthenticate, FilesController.getShow);
    api.get('/files', xTokenAuthenticate, FilesController.getIndex);
    api.put('/files/:id/publish', xTokenAuthenticate, FilesController.putPublish);
    api.put('/files/:id/unpublish', xTokenAuthenticate, FilesController.putUnpublish);
    api.get('/files/:id/data', FilesController.getFile);

    api.all('*', (req, res, next) => {
        errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
    });
    api.use(errorResponse);
};

export default injectRoutes;
