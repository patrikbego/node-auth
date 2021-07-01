const db = require('./db-migrate');
const objectParamMapper = require('./utils/objectParamMapper');
const to = require('../mockObjects');

// eslint-disable-next-line max-len
// NODE_ENV=development jest --detectOpenHandles /Users/pb/develop/tutorials/nodejs-tutorial/src/repository/db-migrate.test.js
const tokens = 'tokens';
const usersTableName = 'users';
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

test('select users', async () => {
  const users = await db.from(usersTableName).select('first_name');
  expect(users.length).toEqual(0);
});

test('select tokens', async () => {
  const users = await db.from(tokens).select('id');
  expect(users.length).toEqual(0);
});

test('insert 10 tokens', async () => {
  const userIns = to.user;
  const iq = objectParamMapper.generateInsertString(userIns, usersTableName);
  await db.raw(iq.text.replace(/[$]\d\d?/g, '?'), iq.values);///[$]\d\d?/g knex does not work with $1 param same as pg
  const objectIns = to.token;
  for (let i = 0; i < 10; i++) {
    objectIns.token += i;
    objectIns.token.substring(0, 100);
    const query = objectParamMapper.generateInsertString(objectIns, tokens);
    console.log(`running ${query}`);
    await db.raw(query.text.replace(/[$]\d\d?/g, '?'), query.values);///[$]\d\d?/g knex does not work with $1 param same as pg
  }
  const users = await db.from(tokens).select('id');
  expect(users.length).toEqual(10);
});

test('insert 10 users + 1 from above test', async () => {
  const objectIns = to.user;
  for (let i = 0; i < 10; i++) {
    objectIns.firstName += i;
    objectIns.firstName.substring(0, 100);
    const query = objectParamMapper.generateInsertString(objectIns, usersTableName);
    console.log(`running ${query}`);
    await db.raw(query.text.replace(/[$]\d\d?/g, '?'), query.values);///[$]\d\d?/g knex does not work with $1 param same as pg
  }
  const users = await db.from(usersTableName).select('first_name');
  expect(users.length).toEqual(11);
});
