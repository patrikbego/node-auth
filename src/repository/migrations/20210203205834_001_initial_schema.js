const sqlAuthQueries = require('../sql/sqlAuthQueries');

exports.up = async function (knex) {
  await knex.raw(sqlAuthQueries.createUsersTable);
  await knex.raw(sqlAuthQueries.createTokensTable);
  await knex.raw(sqlAuthQueries.createAuthTable);
};

exports.down = async function (knex) {
  await knex.raw('DROP TABLE auth');
  await knex.raw('DROP TABLE tokens');
  await knex.raw('DROP TABLE users');
};
