const to = require('../../mockObjects');

const objectMapper = require('./objectMapper');

describe('postgres test', () => {

  const object = to.user;

  it('object mapper', () => {
    const objectValuesArray = Object.values(object);
    const objectKeysArray = Object.keys(object);

    for (let i = 0; i < objectKeysArray.length; i++) {
      console.log(`${objectKeysArray[i]}->${objectValuesArray[i]}`);
    }
  });

  it('object insert mapper', () => {
    const insertString = objectMapper.generateInsertString(object);
    console.log(insertString);
  });

  it('object to sql re mapper', () => {
    const sqlObject = objectMapper.remapToSqlObject(object);
    console.log(sqlObject);
  });

  it('sql to object re mapper', () => {
    const sqlObject = objectMapper.remapToSqlObject(object);
    console.log(sqlObject);
    const jsObject = objectMapper.remapFromSqlObject(sqlObject);
    console.log(jsObject);
    expect(jsObject.firstName).toMatch(object.firstName);
  });
});
