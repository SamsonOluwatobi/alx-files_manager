/**
 * UsersController Module
 * -----------------------
 * This module defines the application controller functions for user-related
 * operations such as user creation and retrieval of the current user.
 *
 * Endpoints:
 * - `POST /users`: Creates a new user in the database.
 * - `GET /users/me`: Retrieves the authenticated user's details.
 */

/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';

const userQueue = new Queue('email sending');

/**
 * Controller for handling user-related operations.
 */
export default class UsersController {
  /**
   * Creates a new user.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (user) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = sha1(password);
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: hashedPassword });
    const userId = insertionInfo.insertedId.toString();

    userQueue.add({ userId });
    res.status(201).json({ email, id: userId });
  }

  /**
   * Retrieves the current user's information.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async getMe(req, res) {
    const { user } = req;

    res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
