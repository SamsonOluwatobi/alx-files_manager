/* eslint-disable import/no-named-as-default */
import { expect } from 'chai'; // Importing assertion library 'chai' for expectations
import redisClient from '../../utils/redis'; // Importing the redisClient utility

describe('+ RedisClient utility', () => {
  
  // before hook to initialize the Redis client with a delay
  before(function (done) {
    this.timeout(10000); // Set timeout for the before hook
    setTimeout(done, 4000); // Introducing artificial delay for setup
  });

  // Test to check if the Redis client is alive
  it('+ Client is alive', () => {
    expect(redisClient.isAlive()).to.equal(true); // Assert that the client is alive
  });

  // Test for setting and getting a value in Redis
  it('+ Setting and getting a value', async function () {
    await redisClient.set('test_key', 345, 10); // Setting a key-value pair with expiration
    expect(await redisClient.get('test_key')).to.equal('345'); // Expect the value to be 345
  });

  // Test for setting a value with expiration and checking after timeout
  it('+ Setting and getting an expired value', async function () {
    await redisClient.set('test_key', 356, 1); // Set a key with expiration time of 1 second
    setTimeout(async () => {
      // After 2 seconds, the key should expire
      expect(await redisClient.get('test_key')).to.not.equal('356'); // The key should not exist anymore
    }, 2000);
  });

  // Test for setting, deleting, and then checking the deleted value in Redis
  it('+ Setting and getting a deleted value', async function () {
    await redisClient.set('test_key', 345, 10); // Set key with value
    await redisClient.del('test_key'); // Delete the key immediately
    setTimeout(async () => {
      // After the delay, verify that the key is deleted
      console.log('del: test_key ->', await redisClient.get('test_key')); // Log the result
      expect(await redisClient.get('test_key')).to.be.null; // Expect the key to be null (deleted)
    }, 2000);
  });
});
