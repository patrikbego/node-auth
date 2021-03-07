const assert = require('assert');
const { Pool } = require('pg');
const objectMapper = require('./utils/objectMapper');
const config = require('../../config.local');

const objectRepository = {
  getPool(pool) {
    if (pool) {
      return pool;
    }
    return new Pool({
      user: config.postgres.user,
      host: config.postgres.host,
      database: config.postgres.database,
      password: config.postgres.password,
      port: config.postgres.port,
      idleTimeoutMillis: 30000,
      // connectionTimeoutMillis: 2000,
      connectionTimeoutMillis: 200000,
    });
  },
  async create(pool, object, table) {
    pool = objectRepository.getPool(pool);
    const query = objectMapper.generateInsertString(object, table);
    // (async function () {
    const client = await pool.connect();
    try {
      await client.query(query);
      return object;
    } catch (err) {
      console.trace(`insert failed ${err}`);
      throw err;
    } finally {
      console.log('======> create client has started <======');
      client.release(true);
      assert(pool.idleCount === 0);
      assert(pool.totalCount === 0);
      console.log('======> create client has ended <======');
    }
  },
  async select(pool, whereObject, table, orderByObject) {
    pool = objectRepository.getPool(pool);
    const query = objectMapper.generateSelectString(whereObject, orderByObject, table);
    // (async function () {
    const client = await pool.connect();
    const result = [];
    try {
      console.log(`running query ${query}`);
      const res = await client.query(query);
      for (const row of res.rows) {
        console.log(row);
        result.push(objectMapper.remapFromSqlObject(row));
      }
      return result;
    } catch (err) {
      console.trace(`Select failed ${err}`);
      throw err;
    } finally {
      console.log('======> select client has started <======');
      client.release(true);
      assert(pool.idleCount === 0);
      assert(pool.totalCount === 0);
      assert(pool.waitingCount === 0);
      console.log('======> select client has ended <======');
    }
  },
  async run(pool, query) {
    pool = objectRepository.getPool(pool);
    const client = await pool.connect();
    try {
      const res = await client.query(query);
      console.log(res);
      console.log(`${query} run successfully`);
    } catch (err) {
      console.trace(`Query failed ${err}`);
      throw err;
    } finally {
      console.log('======> run client has started <======');
      client.release(true);
      assert(pool.idleCount === 0);
      assert(pool.totalCount === 0);
      console.log('======> run client has ended <======');
    }
  },
  async update(pool, setObject, whereObject, table) {
    pool = objectRepository.getPool(pool);
    const query = objectMapper.generateUpdateString(setObject, table, whereObject);
    console.log('running query ', query);
    const client = await pool.connect();
    try {
      await client.query(query);
    } catch (err) {
      console.trace(`Update failed ${err}`);
      throw err;
    } finally {
      console.log('======> update client has started <======');
      client.release(true);
      assert(pool.idleCount === 0);
      assert(pool.totalCount === 0);
      console.log('======> update client has ended <======');
    }
  },
  async exists(pool, whereObject, table) {
    pool = objectRepository.getPool(pool);
    const res = await objectRepository.select(pool, whereObject, table);
    return res && res.length > 0;
  },
};

module.exports = objectRepository;
