const { Pool } = require('pg');
const assert = require('assert');
const to = require('../mockObjects');
const userService = require('./userService');
const sqlQueries = require('../repository/sql/sqlQueries');
const tokenService = require('./tokenService');
const authService = require('./authService');
const { run } = require('../repository/objectRepository');

describe('AuthService test', () => {
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
    const authQuery = sqlQueries.createAuthTable;
    const authRes = await client.query(authQuery);
    expect(authRes).toBeTruthy();
    console.log('======> 1 beforeAll client has ended start <======');
    client.release(true);
    assert(pool.idleCount === 0);
    assert(pool.totalCount === 0);
    console.log('======> 2 beforeAll client has ended end <======');
  });

  afterAll(async (done) => {
    console.log(`pool.totalCount ${pool.totalCount}`);
    console.log(`pool.idleCoun ${pool.idleCount}`);
    await run(pool, 'DROP  TABLE auth');
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

  test('sigunp login logout test', async () => {
    const objectIns = to.user;

    const signupRes = await authService.signUp(pool, objectIns, true);
    expect(signupRes.code).toBe(200);
    expect((await authService.getAllAuths(pool, { userId: 1, status: 'new' })).clientData.length)
      .toBe(1);

    const updatedUser = await userService.getUser(pool, objectIns);
    const user = updatedUser.clientData;
    expect(user.firstName).toBe('pb');
    expect(user.status).toBe('new');

    const tokenDres = await tokenService.getToken(pool, { phone: user.phone });
    expect(parseInt(tokenDres.clientData.expires, 10)).toBeGreaterThan(Date.now());
    expect(tokenDres.clientData.id).toBeTruthy();

    const confirmRes = await authService.confirmEmail(pool, tokenDres.clientData);
    expect(confirmRes.code).toBe(200);

    const loginRes = await authService.login(pool, objectIns);
    expect(loginRes.code).toBe(200);
    const auths = await authService.getAllAuths(pool, { userId: 1, loginRetry: 1, status: 'deleted' });
    expect(auths.clientData.length).toBe(1);

    //TODO fix this
    // const tokenDresLog = await tokenService.getToken(pool, loginRes.clientData.token);
    // expect(tokenDresLog.clientData.id).toBeTruthy();
    //
    // const logoutRes = await authService.logout(pool, user);
    // expect(logoutRes.code).toBe(200);
    //
    // const tokenDresLogout = await tokenService.getToken(pool, loginRes.clientData.token);
    // expect(tokenDresLogout.clientData).toBe(null);
  });
});
