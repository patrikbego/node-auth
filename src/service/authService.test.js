const to = require('../mockObjects');
const userService = require('./userService');
const tokenService = require('./tokenService');
const authService = require('./authService');
const db = require('../repository/db-migrate');

describe('AuthService test', () => {
  let pool;

  jest.setTimeout(300000);
  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async (done) => {
    await db.migrate.rollback();
    await db.destroy();
    console.log('Migrating down');
    // server.close();
    done();
  });

  test('Signup login logout test', async () => {
    const objectIns = to.user;

    const signupRes = await authService.signUp(pool, objectIns, false);
    expect(signupRes.code).toBe(200);
    const authObjects = (await authService.getAllAuths(pool, { userId: 1, status: 'NEW' })).clientData;
    expect(authObjects.length).toBe(1);

    objectIns.id = 1; // quick assumption
    const updatedUser = await userService.getUser(pool, objectIns);
    const user = updatedUser.clientData;
    expect(user.firstName).toBe('pb');
    expect(user.status).toBe('NEW');

    const tokenDres = await tokenService.getToken(pool, { email: user.email });
    expect(parseInt(tokenDres.clientData.expires, 10)).toBeGreaterThan(Date.now());
    expect(tokenDres.clientData.id).toBeTruthy();

    // this is just for test purposes (error handling should be better;
    // 47 is hardcoded since we know what is being stored in DB).
    // In live we get token from req param.
    const authToken = authObjects[0].confirmationLink.substring(53);
    const confirmRes = await authService.confirmEmail(pool, { token: authToken });
    expect(confirmRes.code).toBe(200);

    const loginRes = await authService.login(pool, objectIns);
    expect(loginRes.code).toBe(200);
    const auths = await authService.getAllAuths(pool, { userId: 1, loginRetry: 1, status: 'DELETED' });
    expect(auths.clientData.length).toBe(1);

    // TODO fix this
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
