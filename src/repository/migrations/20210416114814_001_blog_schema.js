const sqlBlogQueries = require('../sql/sqlBlogQueries');

exports.up = async function (knex) {
  // await knex.raw(sqlBlogQueries.createBlogCHTable);
  // await knex.raw(sqlBlogQueries.createBlogESTable);
  // await knex.raw(sqlBlogQueries.createBlogENTable);
  // await knex.raw(sqlBlogQueries.createBlogINTable);
  // await knex.raw(sqlBlogQueries.createBlogRUTable);
  // await knex.raw(sqlBlogQueries.createBlogGETable);
  // await knex.raw(sqlBlogQueries.createBlogFRTable);
  // await knex.raw(sqlBlogQueries.createBlogPTTable);
  await knex.raw(sqlBlogQueries.createBlogTable);// TODO split per language
  await knex.raw(sqlBlogQueries.createBlogHistoryTable);

  await knex.raw(`
  CREATE OR REPLACE FUNCTION set_full_text_search_on_blog()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.tokens = to_tsvector(concat(NEW.title, ', ', NEW.body));
      RETURN NEW;
  END;
  $$ language 'plpgsql';
  `);

  await knex.raw('CREATE TRIGGER update_new_full_text_search\n'
      + '  BEFORE UPDATE ON blog\n'
      + '  FOR EACH ROW EXECUTE PROCEDURE set_full_text_search_on_blog()');

  await knex.raw('CREATE TRIGGER insert_new_full_text_search\n'
      + '  BEFORE INSERT ON blog\n'
      + '  FOR EACH ROW EXECUTE PROCEDURE set_full_text_search_on_blog()');

  await knex.raw('ALTER TABLE users ADD COLUMN user_name varchar(100)');
};

exports.down = async function (knex) {
  await knex.raw('DROP TRIGGER update_new_full_text_search ON blog');
  await knex.raw('DROP TRIGGER insert_new_full_text_search ON blog');
  await knex.raw('DROP FUNCTION set_full_text_search_on_blog');
  await knex.raw('DROP TABLE blog');
  await knex.raw('DROP TABLE blog_history');
  await knex.raw('ALTER TABLE users DROP COLUMN user_name');
};
