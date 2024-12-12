/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';

/**
 * Represents an error in this API.
 */
export class APIError extends Error {
  /**
   * Creates an instance of APIError.
   * @param {number} [code=500] The HTTP status code.
   * @param {string} message The error message.
   */
  constructor(code, message) {
    super(message);
    this.code = code || 500;
    this.message = message;
  }
}

/**
 * Middleware to handle errors in the API.
 * @param {Error} err The error object.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next function.
 */
export const errorResponse = (err, req, res, next) => {
  const defaultMsg = `Failed to process ${req.url}`;

  if (err instanceof APIError) {
    res.status(err.code).json({ error: err.message || defaultMsg });
    return;
  }

  res.status(500).json({
    error: err ? err.message || err.toString() : defaultMsg,
  });
};
