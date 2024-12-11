/**
 * DBClient Module
 * -----------------
 * This module provides a class, `DBClient`, to handle interactions with a MongoDB database.
 * It includes methods to check the database connection status and retrieve document counts
 * from specific collections (`users` and `files`).
 *
 * The module exports a singleton instance of `DBClient` for use throughout the application.
 *
 * Environment Variables:
 * - `DB_HOST`: MongoDB server host (default: `localhost`)
 * - `DB_PORT`: MongoDB server port (default: `27017`)
 * - `DB_DATABASE`: MongoDB database name (default: `files_manager`)
 */

import { MongoClient } from 'mongodb';

class DBClient {
    /**
     * Initializes the MongoDB client and connects to the database.
     * The connection details are derived from environment variables or defaults.
     */
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';
        const url = `mongodb://${host}:${port}/${database}`;

        this.connected = false;
        this.db = null;

        // Connect to the MongoDB server
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect()
        .then(() => {
            this.db = this.client.db();
            this.connected = true;
            console.log(`Connected to MongoDB database: ${database}`);
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err);
            this.connected = false;
        });
    }

    /**
     * Checks if the MongoDB client is connected to the server.
     * @returns {boolean} True if the connection is alive, otherwise false.
     */
    isAlive() {
        if (!this.db) {
            return false;
        }
        return this.db.command({ ping: 1 })
            .then(() => true)
            .catch(() => false);
    }

    /**
     * Retrieves the number of documents in the `users` collection.
     * @returns {Promise<number>} The count of documents in the `users` collection.
     */
    async nbUsers() {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            const usersCollection = this.db.collection('users');
            return usersCollection.countDocuments();
        } catch (error) {
            console.error('Error fetching user count:', error);
            return 0;
        }
    }

    /**
     * Retrieves the number of documents in the `files` collection.
     * @returns {Promise<number>} The count of documents in the `files` collection.
     */
    async nbFiles() {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            const filesCollection = this.db.collection('files');
            return filesCollection.countDocuments();
        } catch (error) {
            console.error('Error fetching file count:', error);
            return 0;
        }
    }
}

// Exporting a singleton instance of DBClient
const dbClient = new DBClient();
export default dbClient;
