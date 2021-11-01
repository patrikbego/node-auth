// Update with your config settings.
const path = require('path');
const config = require('../../config.local');

module.exports = {

  development: {
    client: 'pg',
    connection: {
      database: config.postgres.database,
      user: config.postgres.user,
      port: config.postgres.port,
      password: config.postgres.password,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
    },
  },

  staging: {
    client: 'pg',
    connection: {
      database: config.postgres.database,
      user: config.postgres.user,
      password: config.postgres.password,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
    },
  },

  test: {
    client: 'pg',
    connection: {
      user: 'test',
      host: 'localhost',
      database: 'test',
      password: 'test',
      port: 5445,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
    },
  },

  sqlite3: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },

  production: {
    client: 'pg',
    connection: {
      database: config.postgres.database,
      host: config.postgres.host,
      user: config.postgres.user,
      port: config.postgres.port,
      password: config.postgres.password,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
    },
  },

};
