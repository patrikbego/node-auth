const db = require('./db-migrate');
const to = require('../mockObjects');

const objectRepo = require('./objectRepository');
const sqlAuthQueries = require('./sql/sqlAuthQueries');

describe('userRepository test', () => {
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
