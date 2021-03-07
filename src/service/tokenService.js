const jwt = require('jsonwebtoken');
const utils = require('../utils');
const objectRepository = require('../repository/objectRepository');
const userService = require('./userService');

const tokenService = {
  table: 'tokens',
  async createToken(pool, userData) {
    const phone = typeof (userData.phone) === 'string'
    && userData.phone.trim().length > 7
      ? userData.phone.trim() : '';
    const password = typeof (userData.password) === 'string'
    && userData.password.trim().length > 0
      ? userData.password.trim() : '';

    if (phone
        && password
        && !(await objectRepository.exists(pool, { userId: userData.id }, tokenService.table))) {
      const userRes = await userService.getUser(pool, userData, true);

      if (utils.hash(password) === userRes.clientData.password) {
        const tokenId = utils.createRandomString(20);
        const expires = Date.now() + 1000 * 60 * 60;
        const tokenObject = {
          phone,
          token: tokenId,
          userId: userData.id,
          expires,
          createdDate: new Date(),
          updatedDate: null,
          status: 'new',
        };
        // TODO consider retrieving the token here
        await objectRepository.create(pool, tokenObject, tokenService.table);
        return tokenService.getToken(pool, tokenObject);
      }
    }
    return utils.responseObject(400, null, 'Token creation failed');
  },
  async updateToken(pool, data) {
    if (data.phone && await tokenService.isTokenValid(pool, data.phone)) {
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
    const isTokenValid = await tokenService.isTokenValid(pool, data.phone);
    if (data.phone && isTokenValid) {
      const result = await objectRepository.select(pool, { phone: data.phone, status: 'new' }, tokenService.table,
        { id: 'desc' });
      return utils.responseObject(200, '', result.length > 0 ? result[0] : null); // TODO add some logic that prevents returning more than 1 result
    }
    return utils.responseObject(400, '', 'Could not retrieve token.');
  },
  async isTokenValid(pool, phone) {
    const token = (await objectRepository.select(pool, { phone }, tokenService.table, { id: 'desc' }))[0];
    return token.phone === phone && token.expires > Date.now();
  },
  async isRequestTokenValid(pool, headers) {
    const token = utils.extractTokenFromHeaders(headers);
    return !!(token && (await tokenService.isTokenValid(pool, token.phone)));
  },
  async deleteToken(pool, data) {
    if (data.phone
        && await tokenService.isTokenValid(pool, data.phone)) {
      await objectRepository.update(pool, { status: 'deleted' }, { phone: data.phone }, tokenService.table);
      return utils.responseObject(200, '', 'Token deleted successfully!');
    }
    return utils.responseObject(400, '', 'Could not retrieve token.');
  },
  async isJwtValid(pool, phone) {
    const token = (await objectRepository.select(pool, { phone }, tokenService.table, { id: 'desc' }))[0];
    return token.phone === phone && token.expires > Date.now();
  },
  createJwt(user) {
    return jwt.sign({
      id: user ? user.email : null,
      user,
    }, 'my-secret',
    {
      expiresIn: 60 * 120,
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
    res.setHeader('Set-Cookie', `__st=${token}; maxAge=30000; HttpOnly=true; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
    res.setHeader('Set-Cookie', `devst=${token}; maxAge=30000; Path=/; SameSite=None; Secure`); // TODO check security - refer to rest-api.js (initial commit)
    // res.setHeader('Authorization', tokenService.generateJwtToken(req, res, next)); // TODO consider using as secret users password
    return res.status(200).send({ user: req.user, token });
  },
  getJwt(token) {
    const decoded = jwt.verify(token, 'my-secret');
    console.log(decoded); // bar
    return decoded;
  },
};

module.exports = tokenService;
