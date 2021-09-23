const passport = require('passport');
const mock = require('../mockObjects');
const db = require('../repository/db-migrate');

describe('PasportService test', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async (done) => {
    await db.migrate.rollback();
    await db.destroy();
    console.log('Migrating down');
    done();
  });

  // test('cookieExtractor test', async () => {
  //
  // });
  //
  // test('jwt test', async () => {
  //
  // });
  //
  // test('domain-token test', async () => {
  //
  // });
  //
  // test('google-token test', async () => {
  //
  // });

  test('facebook-token new user test', async () => {
    const req = {};
    req.user = mock.user;
    passport.authenticate('facebook-token',
      { session: false, scope: ['email'] }, (err, user, info) => {
        req.user = user;
        console.log(info);
      });
    expect(req.user).toBe(true);
  });

  test('facebook-token user exist test', async () => {
    const req = {};
    req.user = user;
    passport.authenticate('facebook-token',
      { session: false, scope: ['email'] }, (err, user, info) => {
        req.user = user;
      });
  });
});
