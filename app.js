const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const express = require('express');
const cors = require('cors');
require('./src/service/passportService');
const passport = require('passport');
const helmet = require('helmet');
const authRouter = require('./src/routes/authRouter');
const itemRouter = require('./src/routes/itemRouter');
const userRouter = require('./src/routes/userRouter');
const tokenService = require('./src/service/tokenService');
const utils = require('./src/utils');
const blogRouter = require('./src/routes/blogRouter');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.disable('x-powered-by');

const whitelist = ['http://localhost:3000', 'https://localhost',
  'http://localhost:9199', 'https://bego.tips', undefined, 'https://cukin.fun'];
const dynamicCorsOptions = {
  origin(origin, callback) {
    if (origin || whitelist.indexOf(origin) !== -1) { // TODO check on /getItems form nextjs (is it true that since nextjs and nodejs are runing on same machine this is undefined)
      callback(null, true);
    } else {
      callback(new Error(`${origin} not allowed by CORSUS`));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};

// TODO consider adding functionality like "Do you trust this browser"
//  -> based on response set cookie,jwt expiration time to forever
//  (else log out user after an hour)"
app.use((req, res, next) => {
  const token = utils.extractTokenFromHeaders(req.headers);
  // TODO implement cookies as refresh tokens
  if (token) {
    try {
      const decoded = tokenService.getJwt(token); // performs check if expired
      const nt = tokenService.createJwt(decoded.user);
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie // max age set to 7 days (604800 s)
      res.setHeader('Set-Cookie', `__st=${nt}; maxAge=604800; httpOnly: true; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
      res.setHeader('Set-Cookie', `devst=${nt}; maxAge=604800; Path=/; SameSite=None; Secure`);
    } catch (e) {
      console.log(`Token expired ${token}`);
    }
  }
  next();
});

app.use(passport.initialize());

app.use('/api/v1/auth', cors(dynamicCorsOptions), authRouter);
app.use('/api/v1/user', cors(dynamicCorsOptions), userRouter);
app.use('/api/v1/blog', cors(dynamicCorsOptions), blogRouter);
app.use('/api/v1/', cors(dynamicCorsOptions), itemRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
