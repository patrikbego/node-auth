const db = require('./db-migrate');
const objectMapper = require('./utils/objectMapper');
const to = require('../mockObjects');

// eslint-disable-next-line max-len
// NODE_ENV=development jest --detectOpenHandles /Users/pb/develop/tutorials/nodejs-tutorial/src/repository/db-migrate.test.js
const tokens = 'tokens';
const usersTableName = 'users';
beforeAll(async () => {
  // run the migrations and do any other setup here
  await db.migrate.up();
  console.log('Migrating up');
});

afterAll(async () => {
  // run the migrations and do any other setup here
  await db.migrate.down();
  await db.destroy();
  console.log('Migrating down');
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
  const uq = objectMapper.generateInsertString(userIns, usersTableName);
  await db.raw(uq);
  const objectIns = to.token;
  for (let i = 0; i < 10; i++) {
    objectIns.token += i;
    objectIns.token.substring(0, 100);
    const query = objectMapper.generateInsertString(objectIns, tokens);
    console.log(`running ${query}`);
    await db.raw(query);
  }
  const users = await db.from(tokens).select('id');
  expect(users.length).toEqual(10);
});

test('insert 10 users + 1 from above test', async () => {
  const objectIns = to.user;
  for (let i = 0; i < 10; i++) {
    objectIns.firstName += i;
    objectIns.firstName.substring(0, 100);
    const query = objectMapper.generateInsertString(objectIns, usersTableName);
    console.log(`running ${query}`);
    await db.raw(query);
  }
  const users = await db.from(usersTableName).select('first_name');
  expect(users.length).toEqual(11);
});
