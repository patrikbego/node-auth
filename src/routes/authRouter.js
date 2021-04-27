const express = require('express');
const passport = require('passport');
const authService = require('../service/authService');
const utils = require('../utils');
const tokenService = require('../service/tokenService');

const authRouter = express.Router();

require('../service/passportService')();

authRouter.route('/fb').post((req, res, next) => {
  passport.authenticate('facebook-token',
    { session: false, scope: ['email'] }, (err, user, info) => {
      console.log('fb passport user', user);
      console.info('fb passport ingo', info);
      console.error('fb passport error', err);
      req.user = user;
      next();
    })(req, res, next);
},
async (req, res, next) => {
  if (!req.user) {
    return res.status(401).send('User Not Authenticated');
  }
  next();
}, tokenService.generateJwt, tokenService.sendJwt);

authRouter.route('/googl').post((req, res, next) => {
  passport.authenticate('google-token',
    { session: false, scope: ['profile email'] }, (err, user, info) => {
      console.log('google passport user', user);
      console.info('google passport ingo', info);
      console.error('google passport error', err);
      req.user = user;
      next();
    })(req, res, next);
},
async (req, res, next) => {
  if (!req.user) {
    return res.status(401).send('User Not Authenticated');
  }
  next();
}, tokenService.generateJwt, tokenService.sendJwt);

authRouter.post('/signin', async (req, res, next) => {
  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64')
    .toString('ascii');
  const [username, password] = credentials.split(':');
  // let resObject = authService.login({ phone: username, password })
  const data = { email: username, password };

  passport.authenticate('domain-token',
    { session: false, scope: ['profile email'] }, (err, user, info) => {
      console.log('domain passport user', user);
      console.info('domain passport info', info);
      console.error('domain passport error', err);
      req.user = user;
      next();
    })(req, res, next);
},
async (req, res, next) => {
  if (!req.user) {
    return res.status(401).send('User Not Authenticated');
  }
  next();
}, tokenService.generateJwt, tokenService.sendJwt);

authRouter.post('/signup', async (req, res) => {
  const resObject = await utils.requestWrapper(authService.signUp, req.body,
    req.headers,
    tokenService.isRequestTokenValid, false);
  res.status(resObject.code).json(resObject.clientData);
});

authRouter.post('/confirmEmail', async (req, res) => {
  const resObject = await utils.requestWrapper(authService.confirmEmail,
    req.body, req.headers,
    tokenService.isRequestTokenValid, false);
  res.status(resObject.code).json(resObject.clientData);
});

module.exports = authRouter;
