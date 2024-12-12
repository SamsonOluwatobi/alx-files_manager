/* eslint-disable import/no-named-as-default */
import dbClient from '../../utils/db';

// Tests for AppController API endpoints
describe('+ AppController', () => {
  // Before all tests, clear users and files collections
  before(function (done) {
    this.timeout(10000);
    Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
      .then(([usersCollection, filesCollection]) => {
        Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
          .then(() => done())
          .catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
  });

  // Test the /status endpoint
  describe('+ GET: /status', () => {
    it('+ Services are online', function (done) {
      request.get('/status')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ redis: true, db: true }); // Validate service status
          done();
        });
    });
  });

  // Test the /stats endpoint
  describe('+ GET: /stats', () => {
    it('+ Correct statistics about db collections', function (done) {
      request.get('/stats')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ users: 0, files: 0 }); // Validate initial collection stats
          done();
        });
    });

    it('+ Correct statistics about db collections [alt]', function (done) {
      this.timeout(10000);
      // Insert dummy data into collections and validate the updated stats
      Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
        .then(([usersCollection, filesCollection]) => {
          Promise.all([
            usersCollection.insertMany([{ email: 'john@mail.com' }]),
            filesCollection.insertMany([
              { name: 'foo.txt', type: 'file' },
              { name: 'pic.png', type: 'image' },
            ]),
          ])
            .then(() => {
              request.get('/stats')
                .expect(200)
                .end((err, res) => {
                  if (err) {
                    return done(err);
                  }
                  expect(res.body).to.deep.eql({ users: 1, files: 2 }); // Validate updated collection stats
                  done();
                });
            })
            .catch((deleteErr) => done(deleteErr));
        }).catch((connectErr) => done(connectErr));
    });
  });
});
