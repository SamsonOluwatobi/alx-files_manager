/**
 * FilesController.js
 *
 * This module provides the `FilesController` class, which manages file-related operations
 * for a file management system. It includes methods to handle file uploads, folder creation,
 * and validation of file and folder attributes. It integrates with a database and Redis cache
 * for user authentication and file storage.
 *
 * Dependencies:
 * - uuid: Generates unique identifiers for files.
 * - fs: Provides file system operations.
 * - path: Handles file paths.
 * - util: Promisifies functions for async/await usage.
 * - dbClient: Database client for MongoDB interactions.
 * - redisClient: Redis client for caching and session management.
 *
 * Environment Variables:
 * - FOLDER_PATH: Specifies the directory for storing files (defaults to `/tmp/files_manager`).
 */

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const writeFile = promisify(fs.writeFile);

class FilesController {
  /**
   * Handles file and folder uploads.
   *
   * Validates the user's authentication token, ensures the validity of file metadata,
   * and handles storage for folders, files, or images. Folders are saved in the database,
   * while files are stored on disk with their paths recorded in the database.
   *
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   * @returns {Object} JSON response with the status and file details or error message.
   */
  static async postUpload(req, res) {
    // Validate authentication token
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Extract and validate file data from the request body
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parent folder, if specified
    const parentFile = parentId === 0 ? null : await dbClient.db.collection('files').findOne({ _id: dbClient.id(parentId) });
    if (parentId !== 0 && !parentFile) {
      return res.status(400).json({ error: 'Parent not found' });
    }
    if (parentFile && parentFile.type !== 'folder') {
      return res.status(400).json({ error: 'Parent is not a folder' });
    }

    // Prepare file data for database insertion
    const fileData = {
      userId: dbClient.id(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? '0' : dbClient.id(parentId),
    };

    // Handle folder creation
    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(fileData);
      return res.status(201).json({ id: result.insertedId, ...fileData });
    }

    // Handle file or image creation
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    const localPath = path.join(folderPath, uuidv4());
    await writeFile(localPath, Buffer.from(data, 'base64'));

    fileData.localPath = localPath;

    const result = await dbClient.db.collection('files').insertOne(fileData);

    return res.status(201).json({ id: result.insertedId, ...fileData });
  }
}

export default FilesController;
