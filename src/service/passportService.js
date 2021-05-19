const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const HeaderStrategy = require('passport-http-header-strategy').Strategy;
const config = require('../../config.local');
const userService = require('./userService');
const utils = require('../utils');
const tokenService = require('./tokenService');

passport.serializeUser((user, done) => {
  console.log(user, 'from passport');
  done(null, user);
});
passport.deserializeUser((user, done) => {
  console.log(user, 'from passport');
  done(null, user);
});

module.exports = function () {
  const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) {
      token = utils.extractTokenFromHeaders(req.headers);
    }
    return token;
  };

  const opts = {};
  opts.jwtFromRequest = cookieExtractor;
  opts.secretOrKey = config.hashingSecret;
  // opts.issuer = 'accounts.examplesoft.com';
  // opts.audience = 'yoursite.net';
  passport.use('jwt', new JwtStrategy(opts, (async (jwt, done) => {
    const user = tokenService.getJwt(jwt);
    if (user) done(null, user && user.length > 0 ? user[0] : null);
    else done(null, { message: 'Wrong Password' });
  })));

  passport.use(
    'domain-token',
    new HeaderStrategy(
      { header: 'authorization', passReqToCallback: true },
      async (req, token, done) => {
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64')
          .toString('ascii');
        const [email, password] = credentials.split(':');
        // let resObject = authService.login({ phone: username, password })

        try {
          const user = await userService.getUser(null, { email }, true);

          if (!user || !user.clientData) {
            return done(null, false, { message: 'User not found' });
          }

          if (user.clientData.password !== utils.hash(password)) {
            return done(null, false, { message: 'Email or Password is not correct' });
          }

          user.clientData.password = '';
          return done(null, user.clientData, { message: 'Logged in Successfully' });
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.use('facebook-token', new FacebookTokenStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    profileFields: ['id', 'email', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName'],
  },
  (async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    const user = await userService.createOrUpdateUser(null, profile);

    done(null, user && user.length > 0 ? user[0] : null);
  })));

  passport.use('google-token', new GoogleTokenStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    scope: 'email profile openid',
  },
  (async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    const user = await userService.createOrUpdateUser(null, profile);

    done(null, user && user.length > 0 ? user[0] : null);
  })));
};
