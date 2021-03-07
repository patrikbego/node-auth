// Dependencies
const crypto = require('crypto');
const https = require('https');
const config = require('../config.local');

// Container for all the helpers
const utils = {
  // Parse a JSON string to an object in all cases, without throwing
  parseJsonToObject(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error(`Cant parse json ${str} to object: ${e}`);
      return {};
    }
  },

  // Create a SHA256 hash
  hash(str) {
    if (typeof (str) === 'string' && str.length > 0) {
      return crypto.createHmac('sha256', config.hashingSecret)
        .update(str, undefined, undefined).digest('hex');
    }
    return false;
  },

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  responseObject(code, serverData, clientData) {
    return {
      code,
      serverData,
      clientData,
    };
  },

  createRandomString(strLength) {
    strLength = typeof (strLength) === 'number' && strLength > 0
      ? strLength
      : false;
    if (strLength) {
      // Define all the possible characters that could go into a string
      const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

      // Start the final string
      let str = '';
      for (let i = 1; i <= strLength; i++) {
        // Get a random character from the possibleCharacters string
        const randomCharacter = possibleCharacters.charAt(
          Math.floor(Math.random() * possibleCharacters.length),
        );
        // Append this character to the string
        str += randomCharacter;
      }
      // Return the final string
      return str;
    }
    return false;
  },

  async requestAsync(options) {
    return new Promise((resolve, reject) => {
      const postReq = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(chunk);
          resolve(chunk);
        });
        res.on('error', (err) => {
          console.log(err);
          reject(err);
        });
      });
      postReq.end();
    });
  },

  objectToParams(object) {
    let str = '';
    for (const key in object) {
      if (str !== '') {
        str += '&';
      }
      str += `${key}=${encodeURIComponent(object[key])}`;
    }
    console.log(str);
    return str;
  },

  async requestWrapper(
    func, data, headers, isRequestTokenValid, authRequired, pool,
  ) {
    try {
      if (authRequired) {
        const isTokenValid = await isRequestTokenValid(headers);
        if (!isTokenValid) {
          return utils.responseObject(401, '', 'Unauthorized!');
        }
      }
      const result = await func(pool, data);
      return utils.responseObject(result.code, result.serverData, result.clientData);
    } catch (err) {
      const message = `Request processing failed: ${err}`;
      console.error(message);
      console.trace(err);
      return utils.responseObject(400, '', message);
    }
  },

  extractTokenFromHeaders(headers) {
    let token = '';

    const list = {};
    const rc = headers.cookie;
    rc && rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      console.log(
        `cookie: ${parts[0]}=${parts[1]}`,
      );
      if (parts[0].trim() === '__st' || parts[0].trim() === 'devst') {
        token = parts[1];
      }
    });
    return token;
  },

  simpleSum(a, b) {
    return a + b;
  },
  strictSum(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
      return a + b;
    }
    throw Error('Invalid Arguments');
  },
  promiseSum(a, b) {
    const sum = (a, b) => a + b;

    const rej = () => {
      throw Error('Invalid Arguments');
    };
    const serviceResponse = new Promise((resolve, reject) => {
      if (typeof a === 'number' && typeof b === 'number') {
        setTimeout(() => {
          resolve(sum(a, b));
          console.log('summing up !');
        }, 50, a, b);
      } else {
        reject(rej());
      }
    });
    return serviceResponse;
  },
};

module.exports = utils;
