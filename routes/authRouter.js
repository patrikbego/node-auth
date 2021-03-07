const express = require('express');
const passport = require('passport');
const authService = require('../src/service/authService');
const utils = require('../src/utils');
const tokenService = require('../src/service/tokenService');

const authRouter = express.Router();

require('../src/service/passportService')();

authRouter.route('/fb')
  .post(passport.authenticate('facebook-token',
    { session: false, scope: ['email'] }),
  async (req, res, next) => {
    if (!req.user) {
      return res.send(401, 'User Not Authenticated');
    }
    next();
  }, tokenService.generateJwt, tokenService.sendJwt);

authRouter.post('/signin', async (req, res, next) => {
  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64')
    .toString('ascii');
  const [username, password] = credentials.split(':');
  // let resObject = authService.login({ phone: username, password })
  const data = { phone: username, password };
  const resObject = await utils.requestWrapper(authService.login, data,
    req.headers,
    tokenService.isRequestTokenValid, false);
  let token = null;
  if (resObject.clientData) {
    token = tokenService.createJwt(resObject.clientData.user);
  }
  res.setHeader('Set-Cookie', `__st=${token}; maxAge=30000; HttpOnly=true; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
  res.setHeader('Set-Cookie', `devst=${token}; maxAge=30000; Path=/; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
  // res.setHeader('Authorization', tokenService.generateJwtToken(req, res, next)); // TODO consider using as secret users password
  // res.setHeader('Access-Control-Allow-Credentials', true);
  res.status(resObject.code).json({ user: resObject.clientData.user, token });
});

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
