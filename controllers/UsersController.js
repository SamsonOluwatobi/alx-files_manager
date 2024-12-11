/**
 * UsersController Module
 * -----------------------
 * This module defines the application controller function for user-related
 * operations.
 *
 * Endpoints:
 * - `POST /users`: Creates a new user in the database.
 */

import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  /**
     * Handles the `/users` endpoint.
     * Creates a new user in the database.
     *
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email and password
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists
    const existingUser = await dbClient.db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password
    const hashedPassword = sha1(password);

    // Create new user document
    const newUser = {
      email,
      password: hashedPassword,
    };

    try {
      const result = await dbClient.db.collection('users').insertOne(newUser);
      return res.status(201).json({ id: result.insertedId, email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;