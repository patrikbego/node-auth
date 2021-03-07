// Update with your config settings.
const path = require('path');
const config = require('../../config.local');

module.exports = {

  development: {
    client: 'postgresql',
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

  staging: {
    client: 'postgresql',
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
    client: 'postgresql',
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
    },
  },

};
