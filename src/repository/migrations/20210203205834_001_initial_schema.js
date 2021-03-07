const sqlQueries = require('../sql/sqlQueries');

exports.up = async function (knex) {
  await knex.raw(sqlQueries.createUsersTable);
  await knex.raw(sqlQueries.createTokensTable);
  await knex.raw(sqlQueries.createAuthTable);
};

exports.down = async function (knex) {
  await knex.raw('DROP TABLE auth');
  await knex.raw('DROP TABLE tokens');
  await knex.raw('DROP TABLE users');
};
