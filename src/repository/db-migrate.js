const knex = require('knex');
const config = require('./knexfile');

console.log('From db-migrate', process.env.NODE_ENV);
if (process.env.NODE_ENV.toLowerCase() === 'test') {
  module.exports = knex(config.test);
} else if (process.env.NODE_ENV.toLowerCase() === 'production') {
  console.log('db is configured for knex', config.production);
  module.exports = knex(config.production);
} else {
  module.exports = knex(config.development);
}
