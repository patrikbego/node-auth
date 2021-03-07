const { Pool } = require('pg');
const assert = require('assert');
const to = require('../mockObjects');
const userService = require('./userService');
const sqlQueries = require('../repository/sql/sqlQueries');
const tokenService = require('./tokenService');
const { run } = require('../repository/objectRepository');

// CREATE DATABASE yourdbname;
// CREATE USER youruser WITH ENCRYPTED PASSWORD 'yourpass';
// GRANT ALL PRIVILEGES ON DATABASE yourdbname TO youruser;

// const pool = new Pool({
//   user: 'test',
//   host: 'localhost',
//   database: 'test',
//   password: 'test',
//   port: 5432,
// });
//
// // const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB}`;
// const connectionString = 'postgres://test:test@localhost:5432/test';

describe('tokenService test', () => {
  let pool;

  beforeAll(async () => {
    jest.setTimeout(300000);
    pool = new Pool({
      user: 'test',
      host: 'localhost',
      database: 'test',
      password: 'test',
      port: 5432,
      idleTimeoutMillis: 3000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err); // your callback here
      process.exit(-1);
    });

    pool.on('connect', (client) => {
      console.log('client connected: '); // your callback here
    });

    pool.on('remove', (client) => {
      console.log('client removed: '); // your callback here
    });
    const client = await pool.connect();
    const userQuery = sqlQueries.createUsersTable;
    const userRes = await client.query(userQuery);
    expect(userRes).toBeTruthy();
    const tokeQuery = sqlQueries.createTokensTable;
    const tokenRes = await client.query(tokeQuery);
    expect(tokenRes).toBeTruthy();
    console.log('======> 1 beforeAll client has ended start <======');
    client.release(true);
    assert(pool.idleCount === 0);
    assert(pool.totalCount === 0);
    console.log('======> 2 beforeAll client has ended end <======');
  });

  afterAll(async (done) => {
    console.log(`pool.totalCount ${pool.totalCount}`);
    console.log(`pool.idleCoun ${pool.idleCount}`);
    await run(pool, 'DROP  TABLE tokens');
    await run(pool, 'DROP  TABLE users');
    console.log('Table deleted');
    console.log(`pool.totalCount ${pool.totalCount}`);
    console.log(`pool.idleCoun ${pool.idleCount}`);
    assert(pool.idleCount === 0);
    assert(pool.totalCount === 0);

    await pool.end();
    console.log('======> pool has ended end <======');
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
