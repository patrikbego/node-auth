const utils = require('../utils');
const tokenService = require('./tokenService');
const userService = require('./userService');
const mailgunService = require('./mailgunService');
const objectRepository = require('../repository/objectRepository');

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
    const confirmationToken = `${tokenRes.clientData.token}&email=${userData.email}&phone=${userData.phone}`;
    const link = `http://localhost:3000/confirmEmail?token=${confirmationToken}`; // TODO consider hashing the link

    const authObject = {
      tokenId: tokenRes.clientData.id,
      userId: userRes.clientData.id,
      confirmationLink: link,
      createdDate: new Date(),
      updatedDate: null,
      status: 'NEW',
    };

    await authService.createAuth(pool, authObject);

    // send confirmation email
    mailgunService.template.confirmEmail.text += link;
    if (!test) {
      const mail = await mailgunService.sendEmail(
        mailgunService.template.confirmEmail,
      );
      console.log(mail);
    }

    return utils.responseObject(200, link, 'Please confirm email');
  },
  async confirmEmail(pool, data) {
    const tokenRes = await tokenService.getToken(pool, data);
    // TODO compare to the saved link and user email (this can be done also against user/phone/token) or add a counter
    if (tokenRes.code !== 200) {
      return utils.responseObject(400, '', 'Email confirmation failed');
    }
    // send confirmation email
    const userRes = await userService.getUser(pool,
      { email: tokenRes.clientData.email }, true);
    const user = userRes.clientData;
    user.status = 'CONFIRMED';
    await tokenService.deleteToken(pool, data);
    await authService.markAsDeleted(pool, userRes.clientData, { userId: userRes.clientData.id, status: 'NEW' });
    await userService.updateUser(pool, user);
    return utils.responseObject(200, '', 'Email confirmed');
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
      await objectRepository.create(pool, authObject, authService.table);
      return utils.responseObject(200, '', 'Auth object persisted successfully');
    } catch (err) {
      console.error(`Auth creation failed: ${err}`);
      return utils.responseObject(500, '', 'Could not create new data!');
    }
  },
};
module.exports = authService;
