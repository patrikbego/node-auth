const assert = require('assert');
const unitTestPoc = require('./utils');

describe('tokenService test', () => {
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
