const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { check } = require('express-validator');
const authService = require('../service/authService');
const utils = require('../utils');
const tokenService = require('../service/tokenService');

const authRouter = express.Router();

require('../service/passportService')();

const errorRouteMessage = { message: 'User does not exist or password is not correct!' };

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
    return res.status(401).send(req.message ? { message: req.message } : errorRouteMessage);
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
    return res.status(401).send(req.message ? { message: req.message } : errorRouteMessage);
  }
  next();
}, tokenService.generateJwt, tokenService.sendJwt);

authRouter.post('/signin',
  check('email').isEmail().withMessage('Invalid email format'),
  async (req, res, next) => {
    passport.authenticate('domain-token', { session: false, failWithError: true },
      (err, user, info) => {
        console.log('domain passport user', user);
        console.info('domain passport info', info);
        console.error('domain passport error', err);
        req.user = user;
        req.message = err;
        next();
      })(req, res, next);
  },
  async (req, res, next) => {
    if (!req.user) {
      return res.status(401).send(req.message ? { message: req.message } : errorRouteMessage);
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

const refreshTokens = {};
const SECRET = 'hard secret';

authRouter.post('/token', (req, res, next) => {
  const { username } = req.body;
  const { refreshToken } = req.body;
  if ((refreshToken in refreshTokens) && (refreshTokens[refreshToken] === username)) {
    const user = {
      username,
      role: 'admin',
    };
    const token = jwt.sign(user, SECRET, { expiresIn: 300 });
    res.json({ token: `JWT ${token}` });
  } else {
    res.send(401);
  }
});

module.exports = authRouter;
