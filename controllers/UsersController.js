/**
 * UsersController Module
 * -----------------------
 * Handles user-related operations, including creating new users in the database.
 *
 * Endpoints:
 * - POST /users: Create a new user.
 */

import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  /**
     * Handles the POST /users endpoint.
     * Creates a new user in the database if email and password are valid.
     *
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     */
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      // Check for missing email or password
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Check if user already exists
      const existingUser = await dbClient.db
        .collection('users')
        .findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password
      const hashedPassword = sha1(password);

      // Create the new user
      const newUser = { email, password: hashedPassword };
      const result = await dbClient.db.collection('users').insertOne(newUser);

      // Respond with the newly created user's ID and email
      return res.status(201).json({ id: result.insertedId, email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
