const to = require('../mockObjects');
const userService = require('./userService');
const tokenService = require('./tokenService');
const db = require('../repository/db-migrate');

// CREATE DATABASE test;
// CREATE USER test WITH ENCRYPTED PASSWORD 'test';
// GRANT ALL PRIVILEGES ON DATABASE test TO test;

// const pool = new Pool({
//   user: 'test',
//   host: 'localhost',
//   database: 'test',
//   password: 'test',
//   port: 5432,
// });
//
// // const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5444/${process.env.POSTGRES_DB}`;
// const connectionString = 'postgres://test:test@localhost:5432/test';

describe('tokenService test', () => {
  let pool;
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

  test('create, update and retrieve token test', async () => {
    const objectIns = to.user;
    const tokenIns = to.token;
    const res = await userService.createUser(pool, objectIns);
    expect(res.code).toBe(200);
    const userRes = await userService.getUser(pool, objectIns);
    const user = userRes.clientData;
    user.password = 'pass123'; // this would actually come from login form
    expect(user.firstName).toBe(objectIns.firstName);

    const tokenRes = await tokenService.createToken(pool, user);
    const token = tokenRes.clientData;
    expect(tokenRes.code).toBe(200);

    const tokenDres = await tokenService.getToken(pool, tokenRes.clientData);
    expect(tokenDres.clientData.token).toBe(token.token);
    expect(tokenDres.clientData.id).toBeTruthy();

    const tokenU = (await tokenService.updateToken(pool, tokenRes.clientData)).clientData;
    expect(parseInt(tokenU.expires, 10)).toBeGreaterThan(parseInt(token.expires, 10));

    const tokenDres1 = await tokenService.getToken(pool, tokenRes.clientData);
    expect(parseInt(tokenDres1.clientData.expires, 10))
      .toBeGreaterThan(parseInt(token.expires, 10));
    expect(tokenDres1.clientData.id).toBeTruthy();

    await tokenService.deleteToken(pool, tokenRes.clientData);

    const tokenDel = await tokenService.getToken(pool, tokenRes.clientData);
    expect(tokenDel.clientData).toBe(null);
  });
});
