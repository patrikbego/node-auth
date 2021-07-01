const utils = require('../utils');
const objectRepository = require('../repository/objectRepository');

const userService = {
  table: 'users',
  async createUser(pool, userData) {
    console.log(`Creating user: ${userData.firstName} ${userData.lastName}`);

    const user = userService.validateUserObject(userData);
    user.status = 'NEW';
    if ((user.phone || user.email) && user.password && user.tosAgreement) {
      user.password = utils.hash(userData.password);
      if (await objectRepository.exists(pool, { phone: user.phone }, userService.table)) {
        return utils.responseObject(400, '',
          'User with this phone number already exists!');
      }
      if (await objectRepository.exists(pool, { email: user.email }, userService.table)) {
        return utils.responseObject(400, '',
          'User with this email already exists!');
      }
      if (await objectRepository.exists(pool, { user_name: user.username }, userService.table)) {
        return utils.responseObject(400, '',
          'User with this username already exists!');
      }
      try {
        if (await objectRepository.create(pool, user, userService.table)) {
          return userService.getUser(pool, userData);
        }
      } catch (err) {
        console.log(`User creation failed: ${err}`);
        return utils.responseObject(500, '', 'Could not create new data!');
      }
    }
    console.log(`User creation failed: ${userData}`);
    return utils.responseObject(400, '', 'cu: User creation failed. cu');
  },
  async createOrUpdateUser(pool, userData) { // TODO add a check on fields and do update in case user data has changed
    const newUser = {
      provider: userData.provider,
      providerId: userData.id,
      firstName: userData.name.givenName,
      lastName: userData.name.familyName,
      email: userData.emails[0].value,
      providerRaw: userData._raw,
    };
    console.log(`Creating user: ${userData}`);
    newUser.status = 'NEW';
    // newUser.password = utils.hash(userData.password);
    if (await objectRepository.exists(pool,
      { provider_id: newUser.providerId }, userService.table)) { // TODO add also a check on email
      console.log('User with this id number already exists!'); // TODO this will fail if user will provide different data later
      return objectRepository.select(pool, { provider_id: newUser.providerId }, userService.table);
    }
    try {
      if (await objectRepository.create(pool, newUser, userService.table)) {
        return objectRepository.select(pool,
          { provider_id: newUser.providerId }, userService.table);
      }
    } catch (err) {
      console.log(`User creation failed: ${err}`);
      return utils.responseObject(500, '', 'Could not create new data!');
    }

    console.log(`User creation failed: ${userData}`);
    return utils.responseObject(400, '', 'cu: User creation failed. cu');
  },
  async getUser(pool, userData, getPassword) {
    if (userData && userData.email) {
      const email = typeof (userData.email) === 'string'
    && userData.email.trim().length > 3 ? userData.email.trim() : false;
      try {
        console.log(`Retrieving user: ${email}`);
        const user = (await objectRepository.select(pool, { email }, userService.table))[0];
        if (!getPassword) {
          user.password = '';
        }
        return utils.responseObject(200, '', user);
      } catch (err) {
        console.log(`User creation failed: ${err}`);
        return utils.responseObject(500, '', 'Could not retrieve data!');
      }
    } else if (userData && userData.email) {
      const email = typeof (userData.email) === 'string'
      && userData.email.trim().length > 3 ? userData.email.trim() : false;
      try {
        console.log(`Retrieving user: ${email}`);
        const user = (await objectRepository.select(pool, { email }, userService.table))[0];
        if (!getPassword) {
          user.password = '';
        }
        return utils.responseObject(200, '', user);
      } catch (err) {
        console.log(`User creation failed: ${err}`);
        return utils.responseObject(500, '', 'Could not retrieve data!');
      }
    }
    return utils.responseObject(500, '', 'user not found');
  },
  async updateUser(pool, userData) {
    console.log(`Updating user: ${userData.firstName} ${userData.lastName}`);
    // const user = userService.validateUserObject(userData);
    const user = userData;
    const originalUser = (await objectRepository.select(pool, { id: user.id }, userService.table))[0];
    if (originalUser.userName !== user.userName
        && await objectRepository.exists(pool, { user_name: user.userName }, userService.table)) {
      return utils.responseObject(400, '',
        'User with this username already exists!');
    }
    originalUser.userName = user.userName;
    originalUser.firstName = user.firstName;
    originalUser.lastName = user.lastName;
    originalUser.status = user.status;
    console.log(
      `Updating user: ${user.firstName} ${user.lastName}`,
    );
    try {
      await objectRepository.update(pool, originalUser, { id: user.id }, userService.table);
      return utils.responseObject(200, '', 'User has been updated successfully!');
    } catch (e) {
      return utils.responseObject(500, '', 'User update failed!');
    }
  },
  async getAllUsers(pool, createdAfterNrOfDays) {
    const result = await objectRepository.select(pool, undefined, userService.table);
    const userList = result.clientData;
    const betweenList = [];
    if (createdAfterNrOfDays) {
      for (let i = 0; i < userList.length; i += 1) {
        const user = userList[i];
        if (user.createdAt > Date.now()
            - (1000 * 60 * 60 * 24 * createdAfterNrOfDays)) {
          betweenList.push(user);
        }
      }
    }
    return utils.responseObject(200, '',
      createdAfterNrOfDays ? betweenList : userList);
  },
  async getByEmail(pool, email) {
    const result = await objectRepository.select(pool, { email }, userService.table);
    for (let i = 0; i < result.length; i += 1) {
      const user = result[i];
      if (user.email.toLowerCase().trim() === email.toLowerCase().trim()) {
        return utils.responseObject(200, '', user);
      }
    }
    return utils.responseObject(200, '', 'Not Found');
  },
  async deleteUser(pool, userData) {
    console.log(`Marking user as deleted: ${userData.email}`);
    userData.status = 'DELETED';
    return userService.updateUser(pool, userData);
  },
  // TODO add correct validation and return validData in the object
  validateUserObject(userData) {
    const firstName = typeof (userData.firstName) === 'string'
    && userData.firstName.trim().length > 0
      ? userData.firstName.trim() : '';
    const lastName = typeof (userData.lastName) === 'string'
    && userData.lastName.trim().length > 0
      ? userData.lastName.trim() : '';
    const userName = typeof (userData.userName) === 'string'
    && userData.userName.trim().length > 0
      ? userData.userName.trim() : '';
    const phone = typeof (userData.phone) === 'string'
    && userData.phone.trim().length > 3
      ? userData.phone.trim() : '';
    const email = typeof (userData.email) === 'string'
    && userData.email.trim().length > 0
      ? userData.email.trim() : false;
    const password = typeof (userData.password) === 'string'
    && userData.password.trim().length > 0
      ? userData.password.trim() : '';
    const address = typeof (userData.address) === 'string'
    && userData.address.trim().length > 0
      ? userData.address.trim() : '';
    const tosAgreement = typeof (userData.tosAgreement) === 'boolean'
        && userData.tosAgreement === true;
    const status = typeof (userData.status) === 'string'
    && userData.status.trim().length > 0
      ? userData.status.trim() : '';
    const createdDate = new Date();
    const updatedDate = null;
    const lastLogin = null;

    return {
      firstName,
      lastName,
      userName,
      phone,
      email,
      password,
      tosAgreement,
      address,
      status,
      createdDate,
      updatedDate,
      lastLogin,
    };
  },
};

module.exports = userService;
