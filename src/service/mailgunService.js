const config = require('../../config.local');

const { username } = config.mailgun;
const { password } = config.mailgun;
const { authorization } = config.mailgun;
const { domain } = config.mailgun;

const utils = require('../utils');

const mailgunService = {
  template: {
    paymentConfirmed: {
      from: `postmaster@${domain}`,
      to: 'patrik.delo@gmail.com',
      subject: 'Hello Patrik Delo',
      text: 'Payment has been confirmed!',
    },

    confirmEmail: {
      from: `postmaster@${domain}`,
      to: 'patrik.delo@gmail.com',
      subject: 'Hello Patrik Delo',
      text: 'Please confirm email by clicking on the link: ',
    },
  },
  async sendEmail(body) {
    const options = {
      hostname: 'api.mailgun.net',
      port: 443,
      path: `/v3/${domain}/messages?${
        utils.objectToParams(body)}`,
      auth: {
        username,
        password,
      },
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    };
    try {
      const result = await utils.requestAsync(options);
      return utils.responseObject(200, '', result);
    } catch (e) {
      console.error(e);
      return utils.responseObject(400, '', 'Email failed being sent.');
    }
  },
};

module.exports = mailgunService;
