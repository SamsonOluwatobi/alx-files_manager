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
import routes from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;

// Load all API routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
