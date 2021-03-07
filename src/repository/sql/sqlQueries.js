const sqlQueries = {
  createUsersTable: `
      CREATE TABLE IF NOT EXISTS users
      (
          id            SERIAL PRIMARY KEY,
          first_name    varchar(100),
          last_name     varchar(100),
          dob           varchar(100),
          phone         varchar(100),
          email         varchar(100),
          password      varchar(2048),
          tos_agreement boolean default false,
          address       varchar(1000),
          role          varchar(100),
          last_login    timeStamp,
          provider varchar(100),
          provider_id          varchar(100),

          status        varchar(100),
          created_date timestamptz,
          updated_date timestamptz
      );
  `,
  createTokensTable: `
      CREATE TABLE IF NOT EXISTS tokens
      (
          id      SERIAL PRIMARY KEY,
          user_id integer REFERENCES users (id),
          token   varchar(4000),
          expires bigint,
          phone   varchar(100),

          status  varchar(100),
          created_date timestamptz,
          updated_date timestamptz
      );
  `,
  createAuthTable: `
      CREATE TABLE IF NOT EXISTS auth
      (
          id                 SERIAL PRIMARY KEY,
          user_id            integer REFERENCES users (id),
          token_id           integer REFERENCES tokens (id),
          confirmation_retry int,
          confirmation_link  varchar(400),
          login_retry        int,
          login_ip           varchar(100),
          
          status             varchar(100),
          created_date timestamptz,
          updated_date timestamptz
      );
  `,

};
module.exports = sqlQueries;
