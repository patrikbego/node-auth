const to = require('../mockObjects');
const userService = require('./userService');
const blogService = require('./blogService');
const db = require('../repository/db-migrate');

describe('BlogService test', () => {
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

  test('create and search for blog test', async () => {
    const userIns = to.user;
    const user = await userService.createUser(pool, userIns);
    for (let i = 0; i < 1; i++) {
      let objectIns = to.blog;
      objectIns.userId = user.clientData.id;
      const res = await blogService.create(pool, objectIns);
      expect(res.code).toBe(200);
      expect(res.clientData[0].title).toBe(objectIns.title);

      objectIns = res.clientData[0];
      objectIns.body = '---\n# foo bar \n---';
      const updateB = await blogService.update(pool, objectIns);
      expect(updateB.code).toBe(200);
      const updatedBlog = await blogService.read(pool, { query: 'foo' });
      expect(updatedBlog.clientData[0].body).toBe(objectIns.body);

      const delB = await blogService.delete(pool, objectIns);
      expect(delB.code).toBe(200);

      const updatedDelBlog = await blogService.read(pool, { query: 'foo' });
      expect(updatedDelBlog.clientData.length).toBe(0);
    }
  });
});
