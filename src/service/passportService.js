const passport = require('passport');
const FacebookStrategy = require('passport-facebook-token');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
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
  opts.secretOrKey = 'my-secret';
  // opts.issuer = 'accounts.examplesoft.com';
  // opts.audience = 'yoursite.net';
  passport.use(new JwtStrategy(opts, (async (jwt, done) => {
    const user = tokenService.getJwt(jwt);
    done(null, user && user.length > 0 ? user[0] : null);
  })));

  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await userService.getUser(null, { email }, false);

          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          const validate = await user.isValidPassword(password);

          if (!validate) {
            return done(null, false, { message: 'Wrong Password' });
          }

          return done(null, user, { message: 'Logged in Successfully' });
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
  passport.use('facebook-token', new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    profileFields: ['id', 'email', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName'],
  },
  (async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    const user = await userService.createOrUpdateUser(null, profile);

    done(null, user && user.length > 0 ? user[0] : null);
  })));
};
