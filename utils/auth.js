/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import sha1 from 'sha1';
import { Request } from 'express';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './db';
import redisClient from './redis';

/**
 * Utility function to extract the user from the Authorization header.
 * This header should contain the authorization token in Basic authentication format.
 * @param {string} authorization The value from the Authorization header in the request.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}|null>} 
 */
const extractUserFromAuthorizationHeader = async (authorization) => {
  if (!authorization) return null;

  const authorizationParts = authorization.split(' ');

  // Check if the Authorization header is in the correct format
  if (authorizationParts.length !== 2 || authorizationParts[0] !== 'Basic') {
    return null;
  }

  const token = Buffer.from(authorizationParts[1], 'base64').toString();
  const sepPos = token.indexOf(':');
  const email = token.substring(0, sepPos);
  const password = token.substring(sepPos + 1);

  // Fetch the user from the database based on the extracted email
  const user = await (await dbClient.usersCollection()).findOne({ email });

  // If user is found, validate the password using SHA1 hash comparison
  if (user && sha1(password) === user.password) {
    return user;
  }

  return null;
};

/**
 * Utility function to extract the user from the X-Token header.
 * The X-Token should map to a user ID stored in Redis.
 * @param {string} token The token from the X-Token header.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}|null>}
 */
const extractUserFromXTokenHeader = async (token) => {
  if (!token) return null;

  // Retrieve the userId associated with the token from Redis
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) return null;

  // Fetch the user from the database using the retrieved userId
  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

  return user || null;
};

/**
 * Extracts user from the Authorization header in the request object.
 * @param {Request} req The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}|null>} 
 */
export const getUserFromAuthorization = async (req) => {
  const authorization = req.headers.authorization || null;
  return extractUserFromAuthorizationHeader(authorization);
};

/**
 * Extracts user from the X-Token header in the request object.
 * @param {Request} req The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}|null>}
 */
export const getUserFromXToken = async (req) => {
  const token = req.headers['x-token'];
  return extractUserFromXTokenHeader(token);
};

// Export the functions as an object to be used in other parts of the application
export default {
  getUserFromAuthorization,
  getUserFromXToken,
};
