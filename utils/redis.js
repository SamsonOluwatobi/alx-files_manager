import { createClient } from 'redis';
import { promisify } from 'util';


/**
 * Redis client class.
 * @class RedisClient
 */
class RedisClient {
  /**
   * Creates a new instance of RedisClient.
   * @constructor
   */
  constructor() {
    /**
     * The Redis client instance.
     * @type {RedisClient}
     */
    this.client = createClient({ host: '127.0.0.1', port: 6379 });

    /**
     * Indicates whether the Redis client is connected.
     * @type {boolean}
     */
    this.isConnected = true;

    // Listen for errors
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
      this.isConnected = false;
    });

    // Handle successful connection to Redis
    this.client.on('connect', () => {
      this.isConnected = true;
    });

    // Promisify the methods for asynchronous use
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /**
   * Checks if the Redis client is connected.
   * @returns {boolean} True if the client is connected, false otherwise.
   */
  isAlive() {
    return this.isConnected;
  }

  /**
   * Gets a value by key.
   * @async
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string|null>} The retrieved value, or null if an error occurs.
   */
  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (err) {
      console.error(`Error getting key ${key}: ${err.message}`);
      return null;
    }
  }

  /**
   * Sets a value with expiration.
   * @async
   * @param {string} key - The key to set.
   * @param {string} value - The value to set.
   * @param {number} duration - The expiration duration in seconds.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async set(key, value, duration) {
    try {
      await this.setAsync(key, value, 'EX', duration);
    } catch (err) {
      console.error(`Error setting key ${key}: ${err.message}`);
    }
  }

  /**
   * Deletes a key.
   * @async
   * @param {string} key - The key to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async del(key) {
    try {
      await this.delAsync(key);
    } catch (err) {
      console.error(`Error deleting key ${key}: ${err.message}`);
    }
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;