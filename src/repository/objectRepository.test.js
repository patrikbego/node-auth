const { Pool } = require('pg');
const assert = require('assert');
const to = require('../mockObjects');

const objectRepo = require('./objectRepository');
const sqlQueries = require('./sql/sqlQueries');

describe('userRepository test', () => {
  let pool;

  beforeAll(async () => {
    jest.setTimeout(300000);
    pool = new Pool({
      user: 'test',
      host: 'localhost',
      database: 'test',
      password: 'test',
      port: 5444,
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
    await objectRepo.run(pool, 'DROP  TABLE tokens');
    await objectRepo.run(pool, 'DROP  TABLE users');
    console.log('Table deleted');
    console.log(`pool.totalCount ${pool.totalCount}`);
    console.log(`pool.idleCoun ${pool.idleCount}`);
    assert(pool.idleCount === 0);
    assert(pool.totalCount === 0);

    await pool.end();
    console.log('======> pool has ended end <======');
    done();
  });

  test('tcreate user table and select', async () => {
    const objectIns = to.user;
    const table = 'users';
    const res1 = await objectRepo.create(pool, objectIns, table);
    expect(res1).toMatchObject(objectIns);

    const res = await objectRepo.select(pool, undefined, table);
    for (const row of res) {
      console.log(row);
    }
    expect(res[0].firstName).toMatch('pb');

    objectIns.firstName = 'johny';
    await objectRepo.update(pool, objectIns, { id: res[0].id }, table);

    const res2 = await objectRepo.select(pool, undefined, table);
    for (const row of res2) {
      console.log(row);
    }
    expect(res2[0].firstName).toMatch('johny');
  });

  test('tcreate token table and select', async () => {
    const objectIns = to.token;
    const table = 'tokens';

    await objectRepo.create(pool, to.user, 'users');
    const res1 = await objectRepo.create(pool, objectIns, table);
    expect(res1).toMatchObject(objectIns);

    const res = await objectRepo.select(pool, undefined, table);
    for (const row of res) {
      console.log(row);
    }
    expect(res[0].userId).toBe(1);

    objectIns.expires = Date.now() + 200000;
    await objectRepo.update(pool, objectIns, { id: 1 }, table);

    const res2 = await objectRepo.select(pool, undefined, table);
    for (const row of res2) {
      console.log(row);
    }
    expect(parseInt(res2[0].expires, 10)).toBeGreaterThan(Date.now());
  });
});
