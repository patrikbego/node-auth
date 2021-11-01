const jwt = require('jsonwebtoken');
const utils = require('../utils');
const objectRepository = require('../repository/objectRepository');
const userService = require('./userService');

require('log-timestamp');

const tokenService = {
  table: 'tokens',
  async createToken(pool, userData) {
    const email = typeof (userData.email) === 'string'
    && userData.email.trim().length > 3
      ? userData.email.trim() : '';
    const password = typeof (userData.password) === 'string'
    && userData.password.trim().length > 0
      ? userData.password.trim() : '';

    if (email
        && password
        && !(await objectRepository.exists(pool, { userId: userData.id }, tokenService.table))) {
      const userRes = await userService.getUser(pool, userData, true);

      if (utils.hash(password) === userRes.clientData.password) {
        const tokenId = utils.createRandomString(20);
        const expires = Date.now() + 1000 * 60 * 5;
        const tokenObject = {
          email,
          token: tokenId,
          userId: userData.id,
          expires,
          createdDate: new Date(),
          updatedDate: null,
          status: 'NEW',
        };
        // TODO consider retrieving the token here
        await objectRepository.create(pool, tokenObject, tokenService.table);
        return tokenService.getToken(pool, tokenObject);
      }
    }
    return utils.responseObject(400, null, 'Token creation failed');
  },
  async updateToken(pool, data) {
    if (data.email && await tokenService.isTokenValid(data.email)) {
      const tokenRes = await tokenService.getToken(pool, data);
      const token = tokenRes.clientData;
      if (token.expires > Date.now()) {
        const expires = Date.now() + 1000 * 60 * 60;
        token.expires = expires;

        await objectRepository.update(pool, token, { id: token.id }, tokenService.table);
        return utils.responseObject(200, '', token);
      }
    }
    return utils.responseObject(400, null, 'Token update failed');
  },
  async getToken(pool, data) {
    const isTokenValid = await tokenService.isTokenValid(data.email);
    if (data.email && isTokenValid) {
      const result = await objectRepository.select(pool, { email: data.email, status: 'NEW' }, tokenService.table,
        { id: 'desc' });
      return utils.responseObject(200, '', result.length > 0 ? result[0] : null); // TODO add some logic that prevents returning more than 1 result
    }
    return utils.responseObject(400, '', 'Could not retrieve token.');
  },
  async isTokenValid(email) {
    const token = (await objectRepository.select(null, { email }, tokenService.table, { id: 'desc' }))[0];
    return token.email === email && token.expires > Date.now();
  },
  async isRequestTokenValid(headers) {
    const token = utils.extractTokenFromHeaders(headers);
    return token && (await tokenService.isJwtHeaderValid(token))
      ? tokenService.decodeJwt(token) : null;
  },
  async deleteToken(pool, data) {
    if (data.email
        && await tokenService.isTokenValid(data.email)) {
      await objectRepository.update(pool, { status: 'DELETED' }, { email: data.email }, tokenService.table);
      return utils.responseObject(200, '', 'Token deleted successfully!');
    }
    return utils.responseObject(400, '', 'Could not retrieve token.');
  },
  // Jwt Logic
  async isJwtTokenValid(pool, email) {
    const token = (await objectRepository.select(pool, { email }, tokenService.table, { id: 'desc' }))[0];
    return token.email === email && token.expires > Date.now();
  },
  async isJwtHeaderValid(token) {
    const decoded = tokenService.decodeJwt(token);
    return decoded.id && decoded.exp > Date.now() / 1000;
  },
  createJwt(user) {
    return jwt.sign({
      id: user ? user.email : null,
      user,
    }, 'my-secret',
    {
      expiresIn: 60 * 30,
    });
  },
  generateJwt(req, res, next) {
    if (req.user) {
      req.token = tokenService.createJwt(req.user);
      console.log(req.token);
    } else {
      console.error('Token cant be generated: no auth present');
    }
    return next();
  },
  sendJwt(req, res) {
    let token = null;
    if (req.user) {
      token = tokenService.createJwt(req.user);
    }
    // TODO for some reason the cookie does not come through over https - it works on localhost
    // const dt = new Date();
    // dt.setTime(dt.getTime() + (1 * 60 * 60 * 1000));
    //
    // res.setHeader('Access-Control-Allow-Credentials', true);
    // res.setHeader('Access-Control-Allow-Origin', 'https://bego.tips');
    // res.setHeader('Access-Control-Allow-Headers', 'true');
    // res.setHeader('Set-Cookie', `__st=${res.token}; Max-Age=1800; HttpOnly; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Set-Cookie', `devstr=${res.token}; Max-Age=30000; Domain=bego.tips; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Set-Cookie', `devst9=${res.token}; Max-Age=30000; Path=/; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Set-Cookie', `devst1=${res.token}; Max-Age=30000; Path=/; SameSite=None;`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Set-Cookie', `devst2=${res.token}; Max-Age=30000; Path=/;`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Set-Cookie', `devst3=${res.token}; Max-Age=30000;`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Set-Cookie', `devst4=${res.token};`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Set-Cookie', `devst5=${res.token}; Domain=bego.tips`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Set-Cookie', `devst5=${res.token}; Domain=bego.tips`); // TODO check security - refer to rest-api.js (initial commit)
    // res.set('WWW-Authenticate', 'x');
    //
    // try {
    //   res.cookie('myCookie1s', res.token, { expires: new Date(Date.now() + 1000 * 60 * 3600), httpOnly: true, secure: true});
    //   res.cookie('myCookie2s', 234, { expires: new Date(Date.now() + 1000 * 60 * 3600), secure: true });
    //   res.cookie('cookieNames', 'cookieValue', { SameSite: 'none', secure: true, httpOnly: true });
    //   res.cookie('myCookie3s', 234, {
    //     expires: new Date(Date.now() + 1000 * 60 * 3600), domain: 'bego.tips', path: '/', SameSite: 'None', secure: true, httpOnly: true
    //   });
    //   res.cookie('myCookie4s', res.token, {
    //     expires: new Date(Date.now() + 1000 * 60 * 3600), domain: '.bego.tips', SameSite: 'None', secure: true,  httpOnly: true,
    //   });
    //   res.cookie('myCookie5s', res.token, { expires: new Date(Date.now() + 1000 * 60 * 3600), secure: true,  httpOnly: true});
    //   res.cookie('bfbfbfs', 'value', { maxAge: 360000, secure: true });
    //
    //   res.cookie('myCookie1', res.token, { expires: new Date(Date.now() + 1000 * 60 * 3600), httpOnly: true});
    //   res.cookie('myCookie2', 234, { expires: new Date(Date.now() + 1000 * 60 * 3600)});
    //   res.cookie('cookieName', 'cookieValue', { SameSite: 'none'});
    //   res.cookie('myCookie3', 234, {
    //     expires: new Date(Date.now() + 1000 * 60 * 3600), domain: 'bego.tips', path: '/', SameSite: 'None',
    //   });
    //   res.cookie('myCookie4', res.token, {
    //     expires: new Date(Date.now() + 1000 * 60 * 3600), domain: '.bego.tips', SameSite: 'None',
    //   });
    //   res.cookie('myCookie5', res.token, { expires: new Date(Date.now() + 1000 * 60 * 3600) });
    //   res.cookie('bfbfbf', 'value', { maxAge: 360000 });
    //   // res.setHeader('Authorization', tokenService.generateJwtToken(req, res, next)); // TODO consider using as secret users password
    //   return res.status(200).cookie('name', 'express').send({ user: req.user, token });
    // } catch (e) {
    //   console.error('Could not set the cookies: ', e);
    // }
    // return res.status(400);

    res.setHeader('Set-Cookie', `__st=${token}; maxAge=30000; HttpOnly=true; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
    res.setHeader('Set-Cookie', `devst=${token}; maxAge=30000; Path=/; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Authorization', tokenService.generateJwtToken(req, res, next)); // TODO consider using as secret users password
    return res.status(200).send({ user: req.user, token });
    // END TODO
  },
  decodeJwt(token) {
    const decoded = jwt.verify(token, 'my-secret');
    console.log(decoded); // bar
    return decoded;
  },
};

module.exports = tokenService;
