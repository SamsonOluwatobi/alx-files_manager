import express from 'express';

/**
 * Adds middlewares to the given Express application.
 * @param {express.Express} api The Express application.
 */
const injectMiddlewares = (api) => {
  api.use(express.json({ limit: '200mb' }));
};

export default injectMiddlewares;
