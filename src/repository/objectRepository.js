const assert = require('assert');
const { Pool } = require('pg');
const objectParamMapper = require('./utils/objectParamMapper');
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
    const query = objectParamMapper.generateInsertString(object, table);
    // (async function () {
    const client = await pool.connect();
    try {
      await client.query(query.text, query.values);
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
    const query = objectParamMapper.generateSelectString(whereObject, orderByObject, table);
    // (async function () {
    const client = await pool.connect();
    const result = [];
    try {
      console.log(`running query ${query.text}`, query.whereValues, query.orderValues);
      const res = await client.query(query.text, query.whereValues);
      for (const row of res.rows) {
        result.push(objectParamMapper.remapFromSqlObject(row));
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
  async run(pool, query, paramsArray) {
    pool = objectRepository.getPool(pool);
    const client = await pool.connect();
    const result = [];
    try {
      const res = await client.query(query, paramsArray);
      console.log(`${query} run successfully`);
      for (const row of res.rows) {
        result.push(objectParamMapper.remapFromSqlObject(row));
      }
      return result;
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
    const query = objectParamMapper.generateUpdateString(setObject, whereObject, table);
    console.log('running query ', query);
    const client = await pool.connect();
    try {
      await client.query(query.text, query.setValues ? query.setValues.concat(query.whereValues) : query.whereValues);
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
