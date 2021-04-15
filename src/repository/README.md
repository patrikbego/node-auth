### Nodejs: Database Schema Migrations and Version Control

One of the more essential features of the development is the database change management.
With each release, we should be able to do fast and reliable database update,
without compromising existing data and having a possibility of rollback in case of the worst-case scenario.

While there is a lot of libraries available like Sequelize and nodejs-db-migrate,
it looks like Knex is the most mature and fits the requirement best.
Knex is multi-platform SQL query builder with built-in migration framework.
It will keep track of executed migration scripts and rollback the unsuccessful migrations if needed.

To do a simple POC, we will need:
[Npm](https://docs.npmjs.com/getting-started),
[Node](https://nodejs.org/en/download/package-manager/),
[Postgres](https://www.postgresql.org/download/),

In this tutorial the following versions were used:
npm: '7.5.1',
node: '15.8.0',
postgres '13.0',
knex: '0.21.17'.

First, we need to install Knex globally, so we can easily use from the command line:  
`npm install knex -g`  
Once the Knex is installed, we need to initialise it in our project:  
`knex init`

This command will create a configuration `knexfile.js` for different environments (development, staging, production).
We need to update the database credentials inside of knexfile.
In case there is a need, we could use different databases in different environments. For example, in development, we could
use a simple in-memory database.

Now that we have configured knexfile, we have to create an initial migration file (initial schema).  
`knex migrate:make --help`

`knex migrate:make 001_initial_schema`  
This command will create a new directory (migrations) and migration javascript file prefixed with the current timestamp.  
It is a good practice to include the release version into a name like in the example above 001.
In that way, we can easily group and manage migration files.

Inside of 001_initial_schema.js file we have 2 functions.
```javascript
exports.up = function(knex) {
  
};

exports.down = function(knex) {
  
};
```

We will populate this method with DML queries (in case of initial schema).  
In `up` we will create a new table. Before that, you will need a schema and user.
Potentially we could also do this with Knex, in case it would be needed.
Usually, since it a one time job, it is done out of application scope.
Guide on creating a new Postgres schema, and a user can be found [here](https://wiki.postgresql.org/wiki/First_steps).

In our case we will just create a simple table:
```javascript
exports.up = function(knex) {
  await knex.raw(`CREATE TABLE test.test (coltest varchar(20))`);
};

exports.down = function(knex) {
  await knex.raw(`DROP TABLE test.test`);
};
```

Now that the script is ready, we can start the migration:
`knex migrate:latest` and to be sure let's also list all migrations `knex migrate:list`

In case something went wrong we can still rollback the latest migration with:
`knex migrate:rollback`

We can use other Knex commands based on a scenario we want to achieve ([ref](http://knexjs.org/#Installation-migrations)).

To rollback all the completed migrations:  
`knex migrate:rollback --all`  
To run the next migration that has not yet been run:  
`knex migrate:up`  
To run the specified migration that has not yet been run:     
`knex migrate:up 001_migration_name.js`  
To undo the last migration that was run:  
`knex migrate:down`  
To undo the specified migration that was run:   
`knex migrate:down 001_migration_name.js`



And that is pretty much it. We can add these commands to package.json scripts and execute them with npm which can later on be
used in your deployment script or CI/CD pipelines.

Refs:
http://knexjs.org/
https://www.rockyourcode.com/docker-postgres-knex-setup/
