# Authorization Nodejs Rest API

This is a Auth Rest API server (node v15.3.0).
The project contains following source files:
```
.
├── Dockerfile
├── README.md
├── app.js // express application config
├── bin
│   └── www // express executable
├── docker-compose.sonar.yml // docker compose for the whole project
├── jest.config.js // jest testing framework configurarion
├── package-lock.json 
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── authRouter.js // signup / signin controller
│   ├── authRouter.test.js
│   ├── itemRouter.js // mock items service
│   ├── itemRouter.test.js
│   ├── userRouter.js // crud user controller
│   ├── userRouter.test.js
├── sonar-scanner.js // scanner config / props
├── src
│   ├── mockObjects.js // utility mock objects
│   ├── repository
│   │   ├── README.md
│   │   ├── db-migrate.js // knex migration script
│   │   ├── db-migrate.test.js
│   │   ├── knexfile.js
│   │   ├── migrations
│   │   │   └── 20210203205834_001_initial_schema.js
│   │   ├── objectRepository.js // orm for the pg datatabse
│   │   ├── objectRepository.test.js
│   │   ├── seeds
│   │   ├── sql
│   │   │   └── sqlAuthQueries.js // DDL queries
│   │   └── utils
│   │       ├── objectMapper.js // orm mapper
│   │       └── objectMapper.test.js
│   ├── service
│   │   ├── authService.js // signup / signin functionality
│   │   ├── authService.test.js 
│   │   ├── itemsService.js // mock functionality
│   │   ├── mailgunService.js // mailgun integration
│   │   ├── passportService.js // social network auth
│   │   ├── tokenService.js // sec token functionality
│   │   ├── tokenService.test.js
│   │   ├── userService.js // crud user functionality
│   │   └── userService.test.js
│   ├── utils.js // general utils for the project
│   └── utils.test.js
└── views
    ├── error.pug
    ├── index.pug
    └── layout.pug
```
&nbsp;  
&nbsp;  

## Prerequisites 
### Create Certificate
Locally you should create a certificate with openssl:
```shell
openssl req -x509 -out localhost.crt -keyout localhost.key \
-newkey rsa:2048 -nodes -sha256 \
-subj '/CN=localhost' -extensions EXT -config <( \
printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```
Update the config.local with private key and certificate
### Configure config.local.js
Credentials need to be updated: 
```javascript
environments.<env> = {
  httpPort: xxx,
  httpsPort: xxx,
  envName: 'test',
  hashingSecret: 'xxx',
  ssl: {
    pk: 'xxx',
    cert: 'xxx'
  },
  stripe: {
    pubKey: 'xxx',
    secKey: 'xxx',
    authorization: 'xxx',
  },
  mailgun: {
    username: 'xxx',
    password: 'xxx',
    authorization: 'xxx',
    domain: 'xxx',
  },
  postgres: {
    user: 'xxx',
    host: 'xxx',
    database: 'xxx',
    password: 'xxx',
    port: xxx,
  },
  facebook: {
    clientID: xxx,
    clientSecret: 'xxx',
    callbackURL: 'xxx',
  },
  sonar: {
    clientID: 'xxx',
  },
};
```

### Run the project  
`node bin/www` or `npm start`

### Code Quality
`docker-compose -f docker-compose.sonar.yml up -d` - starts sonar (optional)
`node sonar-scanner.js`
`eslint .`

### Test execution  
`npm run test` or `jest --detectOpenHandles --collectCoverage .`  

### Running it with docker 
`#docker rm -f $(docker ps -aq)`  
`#docker rmi -f $(docker images -a -q)`  
`docker build -t auth-node .`  
`docker run --name auth-node-api -d -p 8888:3005 auth-node`  

# Run whole environment e2e locally (nginx, postgres, redis, auth-node...)
Refer to automata/README.md.

### References
(Express)[https://expressjs.com/en/guide/routing.html]  
(Jest)[https://jestjs.io/docs/en/getting-started.html]   
(Postgres)[https://node-postgres.com/]   
(Knex)[http://knexjs.org/]  
(Passport)[http://www.passportjs.org/docs/authenticate/]  

