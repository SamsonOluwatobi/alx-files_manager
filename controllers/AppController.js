/**
 * AppController Module
 * ---------------------
 * This module defines the application controller functions for the following
 * API endpoints:
 * - `GET /status`: Returns the health status of Redis and MongoDB.
 * - `GET /stats`: Returns the count of users and files in the database.
 */

import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  /**
     * Handles the `/status` endpoint.
     * Responds with the health status of Redis and MongoDB.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
  static getStatus(req, res) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    return res.status(200).json(status);
  }

  /**
     * Handles the `/stats` endpoint.
     * Responds with the count of users and files in the database.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();
    const stats = {
      users: usersCount,
      files: filesCount,
    };
    return res.status(200).json(stats);
  }
}

export default AppController;
