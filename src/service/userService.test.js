const { Pool } = require('pg');
const assert = require('assert');
const userRepo = require('../repository/objectRepository');
const userQueries = require('../repository/sql/sqlQueries');
const to = require('../mockObjects');
const userService = require('./userService');

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

describe('userService test', () => {
  let pool;
  jest.setTimeout(300000);
  beforeAll(async () => {
    pool = new Pool({
      user: 'test',
      host: 'localhost',
      database: 'test',
      password: 'test',
      port: 5432,
      idleTimeoutMillis: 3000,
      connectionTimeoutMillis: 2000,
    });

    let time;
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
    const query = userQueries.createUsersTable;
    const res = await client.query(query);
    expect(res).toBeTruthy();
    console.log('======> beforeAll client has started <======');
    client.release(true);
    assert(pool.idleCount === 0);
    assert(pool.totalCount === 0);
    console.log('======> beforeAll client has ended <======');
  });

  afterAll(async (done) => {
    console.log(`pool.totalCount ${pool.totalCount}`);
    console.log(`pool.idleCoun ${pool.idleCount}`);
    await userRepo.run(pool, 'DROP  TABLE users');
    // await userRepo.run(pool, 'delete from users');
    console.log('Table deleted');
    console.log(`pool.totalCount ${pool.totalCount}`);
    console.log(`pool.idleCoun ${pool.idleCount}`);
    assert(pool.idleCount === 0);
    assert(pool.totalCount === 0);

    await pool.end();
    console.log('======> pool has ended end <======');
    done();
  });

  test('create and select user test', async () => {
    const objectIns = to.user;
    const res = await userService.createUser(pool, objectIns);
    expect(res.code).toBe(200);
    expect(res.clientData.firstName).toBe(objectIns.firstName);

    objectIns.firstName = 'test';
    const userU = await userService.updateUser(pool, objectIns);
    expect(userU.code).toBe(200);

    const updatedUser = await userService.getUser(pool, objectIns);
    expect(updatedUser.clientData.firstName).toBe('test');

    const deletedUser = await userService.deleteUser(pool, objectIns);
    expect(deletedUser.code).toBe(200);

    const updatedDelUser = await userService.getUser(pool, objectIns);
    expect(updatedDelUser.clientData.status).toBe('deleted');
  });
});
