const jwt = require('jsonwebtoken');
const utils = require('../utils');
const tokenService = require('./tokenService');
const userService = require('./userService');
const mailService = require('./mailService');
const config = require('../../config.local');

const objectRepository = require('../repository/objectRepository');
require('log-timestamp');

// TODO add transactional behaviour
const authService = {
  table: 'auth',
  async login(pool, userData) {
    const reqUser = userService.validateUserObject(userData);
    const userRes = await userService.getUser(pool, userData, true);
    if (!userRes.clientData) {
      return utils.responseObject(401, '', 'Email or password is not correct!');
    }

    const authObject = {
      userId: userRes.clientData.id,
      loginIp: 'TODO',
      loginRetry: 1,
      createdDate: new Date(),
      updatedDate: null,
      status: 'NEW',
    };
    await authService.createAuth(pool, authObject);

    if (userRes && userRes.clientData
        && userRes.clientData.password === utils.hash(reqUser.password)) {
      userRes.clientData.password = '';
      await tokenService.createToken(pool, userData);
      await authService.markAsDeleted(pool, userRes.clientData, { userId: userRes.clientData.id, loginRetry: 1, status: 'NEW' });

      const responseObject = {
        user: userRes.clientData,
      };

      return utils.responseObject(200, 'User logged in ', responseObject);
    }
    return utils.responseObject(401, '', 'Phone or password is not correct!');
  },
  async logout(pool, data) {
    if (data.email
        && await tokenService.isTokenValid(data.email)) {
      const result = await tokenService.deleteToken(pool, data);
      return utils.responseObject(result.code, result.serverData,
        result.clientData);
    }
  },
  async signUp(pool, userData, test) {
    const userRes = await userService.createUser(pool, userData);
    if (userRes.code !== 200) return userRes;
    const tokenRes = await tokenService.createToken(pool, userData);
    const confirmationToken = {
      tokenId: tokenRes.clientData.id,
      email: userData.email,
      phone: userData.phone,
    }; // token expiration 15 mins
    const signedMailConfirmationToken = jwt.sign({ confirmationToken }, config.hashingSecret,
      {
        expiresIn: 60 * 15,
      });
    const link = `${config.host}/api/v1/auth/confirmEmail?token=${signedMailConfirmationToken}`;

    const authObject = {
      tokenId: tokenRes.clientData.id,
      userId: userRes.clientData.id,
      confirmationLink: link,
      createdDate: new Date(),
      updatedDate: null,
      status: 'NEW',
    };

    const authData = (await authService.createAuth(pool, authObject)).serverData;

    // send confirmation email
    if (!test) {
      const templateVars = {
        emailAddress: userData.email,
        resetLink: `${link}&tid=${authObject.tokenId}`,
      };
      const generatedData = mailService.templateFiller(templateVars, 'confirmEmailT');
      await mailService.sendEmail(generatedData, {
        to: userData.email,
        from: 'support@octoplasm.com',
        subject: 'Please confirm your email address',
      });
      console.debug(generatedData);
    }

    return utils.responseObject(200, link, 'Please confirm email');
  },
  async confirmEmail(pool, data) {
    const { token } = data;
    const decodedToken = tokenService.decodeJwt(token);
    const authData = (await objectRepository.select(
      pool, { tokenId: decodedToken.confirmationToken.tokenId }, authService.table,
    ))[0];
    if (!authData.confirmationLink || !authData.confirmationLink.includes(data.token)) {
      return utils.responseObject(400, '', {
        message: 'Email confirmation failed',
        redirectUrl: `${config.host}/login`,
      });
    }
    // send confirmation email
    const userRes = (await objectRepository.select(
      pool, { id: authData.userId }, userService.table,
    ))[0];
    userRes.status = 'CONFIRMED';
    await tokenService.deleteToken(pool, data);
    await authService.markAsDeleted(pool, userRes.clientData, { userId: userRes.id, status: 'NEW' });
    await userService.updateUser(pool, userRes);
    return utils.responseObject(200, '', {
      message: 'Email confirmed',
      redirectUrl: `${config.host}/login`,
    });
  },
  async markAsDeleted(pool, user, whereObject) {
    try {
      const auths = await authService.getAllAuths(pool, whereObject);
      if (auths.clientData) {
        for (const loginRetry of auths.clientData) {
          await objectRepository.update(pool, { status: 'DELETED' },
            { id: loginRetry.id },
            authService.table);
        }
      }
      return utils.responseObject(200, '', `Auth objects for user ${user.id} marked as deleted!`);
    } catch (err) {
      console.error(`Auth deletion failed: ${err}`);
      return utils.responseObject(500, '', 'Could not create new data!');
    }
  },
  async getAllAuths(pool, whereObject) {
    try {
      const auths = await objectRepository.select(pool,
        whereObject,
        authService.table);
      return utils.responseObject(200, '', auths);
    } catch (err) {
      console.error(`Auth retrieval failed: ${err}`);
      return utils.responseObject(500, '', 'Could not retrieve data!');
    }
  },
  async passwordReset(pool) {
    // TODO
  },
  async resendConfirmationEmail(pool) {
    // TODO
  },
  async createAuth(pool, authObject) {
    try {
      const authData = await objectRepository.create(pool, authObject, authService.table);
      return utils.responseObject(200, authData, 'Auth object persisted successfully');
    } catch (err) {
      console.error(`Auth creation failed: ${err}`);
      return utils.responseObject(500, authObject, 'Could not create new data!');
    }
  },
};
module.exports = authService;
