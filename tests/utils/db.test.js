/* eslint-disable import/no-named-as-default */
import dbClient from '../../utils/db'; // Importing the dbClient utility

describe('+ DBClient utility', () => {
  
  // before hook to set up the database before running tests
  before(function (done) {
    this.timeout(10000); // Set timeout for the before hook
    Promise.all([dbClient.usersCollection(), dbClient.filesCollection()]) // Fetching collections
      .then(([usersCollection, filesCollection]) => {
        // Clearing data from the collections before tests
        Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
          .then(() => done()) // Proceed once collections are cleared
          .catch((deleteErr) => done(deleteErr)); // Handle error during deletion
      })
      .catch((connectErr) => done(connectErr)); // Handle connection error
  });

  // Test to check if the DB client is alive
  it('+ Client is alive', () => {
    expect(dbClient.isAlive()).to.equal(true); // Assert that the client is alive
  });

  // Test to check if the number of users is correctly reported
  it('+ nbUsers returns the correct value', async () => {
    expect(await dbClient.nbUsers()).to.equal(0); // Expect 0 users in the DB
  });

  // Test to check if the number of files is correctly reported
  it('+ nbFiles returns the correct value', async () => {
    expect(await dbClient.nbFiles()).to.equal(0); // Expect 0 files in the DB
  });
});
