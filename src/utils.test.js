const assert = require('assert');
const unitTestPoc = require('./utils');

describe('utils test', () => {
  test('extractTokenFromHeaders - header not present', async () => {
    let token = unitTestPoc.extractTokenFromHeaders(null);
    assert.strictEqual(token, undefined);
    token = unitTestPoc.extractTokenFromHeaders({});
    assert.strictEqual(token, undefined);
    token = unitTestPoc.extractTokenFromHeaders(undefined);
    assert.strictEqual(token, undefined);
    token = unitTestPoc.extractTokenFromHeaders('');
    assert.strictEqual(token, undefined);
  });

  test('extractTokenFromHeaders - token not present', async () => {
    const headers = new Headers();
    const token = unitTestPoc.extractTokenFromHeaders(headers);
    assert.strictEqual(token, undefined);

    const headers1 = new Headers();
    headers1.append('Content-Type', 'text/xml');
    headers1.append('xxx', '123');
    headers1.append('Accept', 'application/json');
    headers1.set('Set-Cookie', 'qwerty=219ffwef9w0f; Domain=somecompany.com');
    // headers1.append('Set-Cookie', 'qwerty=219ffwef9w0f; Domain=somecompany.co.uk');
    headers1.append('cookie', 'qwerty=219ffwef9w0f; Domain=somecompany.com');
    const token1 = unitTestPoc.extractTokenFromHeaders(headers1);
    assert.strictEqual(token1, undefined);
  });

  test('extractTokenFromHeaders - token present', async () => {
    const headers = {
      cookie: 'devst=219ffwef9w0f; Domain=somecompany.com',
    };

    const token = unitTestPoc.extractTokenFromHeaders(headers);
    assert.strictEqual(token, '219ffwef9w0f');
  });

  // this is just poc - can be removed
  test('lib.simpleSum should return a number', async () => {
    const sum = unitTestPoc.simpleSum(1, 1);
    assert.strictEqual(typeof (sum), 'number');
  });
  test('lib.simpleSum should return a sum', async () => {
    const sum = unitTestPoc.simpleSum(1, 1);
    assert.strictEqual(sum, 2);
  });
  test('lib.simpleSum should fail', async () => {
    const sum = unitTestPoc.simpleSum(` 1${1}`);
    assert.strictEqual(sum, ' 11undefined');
  });
  test('lib.simpleSum should fail again', async () => {
    const sum = unitTestPoc.simpleSum(` 1${null}`);
    assert.strictEqual(sum, ' 1nullundefined');
  });

  test('lib.strictSum should return a number', async () => {
    const sum = unitTestPoc.strictSum(1, 1);
    assert.strictEqual(typeof (sum), 'number');
  });
  test('lib.strictSum should return a sum', async () => {
    const sum = unitTestPoc.strictSum(1, 1);
    assert.strictEqual(sum, 2);
  });
  test('lib.strictSum should fail', async () => {
    try {
      const sum = unitTestPoc.strictSum(`1${1}`);
    } catch (e) {
      assert.strictEqual(e.message,
        'Invalid Arguments');
    }
  });
  test('lib.strictSum should fail again',
    async () => {
      const expected = Error;
      const exercise = () => unitTestPoc.strictSum(
        ` 1${null}`,
      );
      assert.throws(exercise, expected);
    });
  test('lib.promiseSum should return a number',
    async () => {
      const sum = await unitTestPoc.promiseSum(
        1, 1,
      );
      assert.strictEqual(typeof (sum),
        'number');
    });
  test('lib.promiseSum should return a sum',
    async () => {
      unitTestPoc.promiseSum(1, 1)
        .then((res) => {
          assert.strictEqual(res, NaN);
        });
    });
  test('lib.promiseSum should fail',
    async () => {
      const expected = Error(
        'Invalid Arguments',
      );
      try {
        const sum = await unitTestPoc.promiseSum(
          ' 1', 1,
        );
      } catch (e) {
        assert.strictEqual(e.message,
          expected.message);
      }
    });
});
