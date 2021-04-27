const to = require('../mockObjects');
const userService = require('./userService');
const db = require('../repository/db-migrate');

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
    }
  });
});
