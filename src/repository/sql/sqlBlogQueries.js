const sqlBlogQueries = {
  createBlogTable: `
      CREATE TABLE IF NOT EXISTS blog
      (
          id          SERIAL PRIMARY KEY,
          user_id     integer REFERENCES users (id),
          language    varchar(100),
          original    varchar(100),
          title       text NOT NULL,
          body        text NOT NULL,
          tags        text NOT NULL,

          published   boolean,

          status      varchar(100),
          created_date timestamptz,
          updated_date timestamptz,

          tokens tsvector
      );
  `,
  createBlogHistoryTable: `
      CREATE TABLE IF NOT EXISTS blog_history
      (
          id        SERIAL PRIMARY KEY,
          user_id   integer REFERENCES users (id),
          language  varchar(100),
          original  varchar(100),
          body      varchar(100),

          published boolean,

          status    varchar(100),
          created_date timestamptz,
          updated_date timestamptz
      );
  `,

};
module.exports = sqlBlogQueries;
