const utils = require('../utils');
const userRepository = require('../repository/objectRepository');

const userService = {
  table: 'users',
  async createUser(pool, userData) {
    console.log(`Creating user: ${userData.firstName} ${userData.lastName}`);

    const user = userService.validateUserObject(userData);
    user.status = 'new';
    if ((user.phone || user.email) && user.password && user.tosAgreement) {
      user.password = utils.hash(userData.password);
      if (await userRepository.exists(pool, { phone: user.phone }, userService.table)) {
        return utils.responseObject(400, '',
          'User with this phone number already exists!');
      }
      try {
        console.log(
          `Creating user: ${user.firstName} ${user.lastName}`,
        );
        if (await userRepository.create(pool, user, userService.table)) {
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
    newUser.status = 'new';
    // newUser.password = utils.hash(userData.password);
    if (await userRepository.exists(pool, { provider_id: newUser.providerId }, userService.table)) {//TODO add also a check on email
      console.log('User with this id number already exists!'); // TODO this will fail if user will provide different data later
      return userRepository.select(pool, { provider_id: newUser.providerId }, userService.table);
    }
    try {
      if (await userRepository.create(pool, newUser, userService.table)) {
        return userRepository.select(pool, { provider_id: newUser.providerId }, userService.table);
      }
    } catch (err) {
      console.log(`User creation failed: ${err}`);
      return utils.responseObject(500, '', 'Could not create new data!');
    }

    console.log(`User creation failed: ${userData}`);
    return utils.responseObject(400, '', 'cu: User creation failed. cu');
  },
  async getUser(pool, userData, getPassword) {
    if (userData && userData.phone) {
      const phone = typeof (userData.phone) === 'string'
    && userData.phone.trim().length > 7 ? userData.phone.trim() : false;
      try {
        console.log(`Retrieving user: ${phone}`);
        const user = (await userRepository.select(pool, { phone }, userService.table))[0];
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
        const user = (await userRepository.select(pool, { email }, userService.table))[0];
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
    const exists = await userRepository.exists(pool, { phone: user.phone }, userService.table);
    if (user.phone
        && user.tosAgreement
        && exists) {
      const originalUser = (await userRepository.select(pool,
        { phone: user.phone }, userService.table))[0];
      console.log(
        `Updating user: ${user.firstName} ${user.lastName}`,
      );
      if (originalUser.phone !== user.phone) {
        utils.responseObject(400, '', 'Phone number can\'t  be updated!');
      }
      if (user.password && originalUser.password !== user.password.trim()) {
        utils.responseObject(400, '', 'Requested data can\'t  be updated!');
      }
      try {
        user.password = originalUser.password;
        await userRepository.update(pool, user, { id: originalUser.id }, userService.table);
        return utils.responseObject(200, '', 'User has been updated successfully!');
      } catch (e) {
        return utils.responseObject(500, '', 'User update failed!');
      }
    }
    return utils.responseObject(500, '', 'User fields missing!');
  },
  async getAllUsers(pool, createdAfterNrOfDays) {
    const result = await userRepository.select(pool, undefined, userService.table);
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
    const result = await userRepository.select(pool, { email }, userService.table);
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
    userData.status = 'deleted';
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
