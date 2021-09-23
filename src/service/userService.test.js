const to = require('../mockObjects');
const userService = require('./userService');
const db = require('../repository/db-migrate');
const mailgunService = require('./mailgunService');
const mockObjects = require('../mockObjects');

describe('userService test', () => {
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

  test('create and select user test', async () => {
    for (let i = 0; i < 10; i++) {
      const objectIns = to.user;
      objectIns.phone = (i + objectIns.phone).substring(0, 99);
      objectIns.email = (i + objectIns.email).substring(0, 99);
      const res = await userService.createUser(pool, objectIns);
      expect(res.code).toBe(200);
      expect(res.clientData.firstName).toBe(objectIns.firstName);

      res.clientData.firstName = 'test';
      res.clientData.userName = `test${i}`;
      const userU = await userService.updateUser(pool, res.clientData);
      expect(userU.code).toBe(200);

      const updatedUser = await userService.getUser(pool, res.clientData);
      expect(updatedUser.clientData.firstName).toBe('test');

      const deletedUser = await userService.deleteUser(pool, res.clientData);
      expect(deletedUser.code).toBe(200);

      const updatedDelUser = await userService.getUser(pool, res.clientData);
      expect(updatedDelUser.clientData.status).toBe('DELETED');
    }
  });

  test('signInWithProvider test', async () => {
    const proUserFail = await userService.signInWithProvider(null, () => {
    }, null);
    const allUsersFail = await userService.getAllUsers(null, 1);
    expect(allUsersFail.clientData.length).toBe(0);

    const proUserSuccess = await userService.signInWithProvider(mockObjects.profile, () => {
    }, 'facebook');
    const allUsersSuccess = await userService.getAllUsers(null, 1);
    expect(allUsersSuccess.clientData.length).toBe(1);

    const proUserExist = await userService.signInWithProvider(mockObjects.profile, () => {
    }, 'facebook');
    const allUsersExist = await userService.getAllUsers(null, 1);
    expect(allUsersExist.clientData.length).toBe(1);

    const proUserSameProvider = await userService.signInWithProvider(mockObjects.profile, () => {
    }, 'google');
    const allUsersSameProvider = await userService.getAllUsers(null, 1);
    expect(allUsersSameProvider.clientData.length).toBe(1);
  });
});
