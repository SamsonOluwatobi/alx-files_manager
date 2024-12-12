/**
 * Server Module
 * --------------
 * This module initializes an Express server that listens on a specified port.
 * It loads all API routes defined in the `routes/index.js` file.
 *
 * Environment Variables:
 * - `PORT`: The port the server listens on (default: 5000).
 */

import express from 'express';
import startServer from './lib/boot';
import injectRoutes from './routes';
import injectMiddlewares from './lib/middleware';

/**
 * Initializes and starts the Express server.
 */
const server = express();

injectMiddlewares(server);
injectRoutes(server);
startServer(server);

export default server;
