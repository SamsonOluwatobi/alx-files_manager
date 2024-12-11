/**
 * @fileoverview Handles authentication processes including user connection and disconnection.
 *
 * This module provides two main endpoints:
 * - `GET /connect`: Authenticates a user and generates a token.
 * - `GET /disconnect`: Invalidates the user token, effectively signing out the user.
 *
 * @module controllers/AuthController
 */

import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  /**
   * Signs in the user and generates a new authentication token.
   *
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Decode Base64 credentials
    const base64Credentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate user
    const hashedPassword = sha1(password);
    const usersCollection = await dbClient.usersCollection();
    const user = await usersCollection.findOne({
      email,
      password: hashedPassword,
    });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Generate token
    const token = uuidv4();
    const redisKey = `auth_${token}`;
    await redisClient.set(redisKey, user._id.toString(), 86400); // Token expires in 24 hours

    res.status(200).json({ token });
  }

  /**
   * Signs out the user by invalidating the authentication token.
   *
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await redisClient.del(redisKey);
    res.status(204).send();
  }
}

export default AuthController;
