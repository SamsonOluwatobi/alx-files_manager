import envLoader from '../utils/env';

/**
 * Starts the Express server.
 * @param {express.Express} api The Express application.
 */
const startServer = (api) => {
  envLoader();
  const port = process.env.PORT || 5000;
  const env = process.env.npm_lifecycle_event || 'dev';
  api.listen(port, () => {
    console.log(`[${env}] API has started listening at port:${port}`);
  });
};

export default startServer;