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

export default class UsersController {
  /**
   * Create a new user.
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   */
  static async postNew(req, res) {
    const email = req.body && req.body.email ? req.body.email : null;
    const password = req.body && req.body.password ? req.body.password : null;

    // Validate email and password
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    try {
      // Check if the user already exists
      const usersCollection = await dbClient.usersCollection();
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        res.status(400).json({ error: 'Already exist' });
        return;
      }

      // Insert new user into the database
      const hashedPassword = sha1(password);
      const insertionInfo = await usersCollection.insertOne({ email, password: hashedPassword });
      const userId = insertionInfo.insertedId.toString();

      // Return success response
      res.status(201).json({ id: userId, email });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
