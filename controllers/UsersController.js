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

import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

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

        try {
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

            const result = await dbClient.db.collection('users').insertOne(newUser);

            // Respond with the newly created user's ID and email
            return res.status(201).json({ id: result.insertedId, email });
        } catch (error) {
            console.error('Error creating user:', error.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Handles the `/users/me` endpoint.
     * Retrieves the authenticated user's details based on the authentication token.
     * 
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     *
     * @description
     * The token is expected in the `X-Token` header. The method:
     * - Verifies the token exists in the Redis store.
     * - Fetches the associated user from the database.
     * - Returns the user's ID and email if valid; otherwise, returns an error.
     */
    static async getMe(req, res) {
        try {
            // Retrieve the token from the request headers
            const token = req.header('X-Token');

            if (!token) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Check Redis for the user ID associated with the token
            const userId = await redisClient.get(`auth_${token}`);

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Fetch the user from the database
            const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Return the user's details (id and email only)
            return res.status(200).json({
                id: user._id.toString(),
                email: user.email,
            });
        } catch (error) {
            console.error('Error in getMe:', error.message); // Improved error logging
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default UsersController;
