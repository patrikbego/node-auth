const to = require('../../mockObjects');

const objectParamMapper = require('./objectParamMapper');

describe('postgres test', () => {
  const object = to.user;
  it('object update mapper', () => {
    const udpateObject = objectParamMapper.generateUpdateString({ firstName: 'testUpdate' }, { id: 1 }, 'users');
    console.log(udpateObject);
    expect(udpateObject.text).toBe('update users SET  first_name = $1 where id = $2 ');
    expect(udpateObject.setValues[0]).toBe('testUpdate');
    expect(udpateObject.whereValues[0]).toBe(1);
  });

  it('object mapper', () => {
    const objectValuesArray = Object.values(object);
    const objectKeysArray = Object.keys(object);

    for (let i = 0; i < objectKeysArray.length; i++) {
      console.log(`${objectKeysArray[i]}->${objectValuesArray[i]}`);
    }
  });

  it('object insert mapper', () => {
    const insertString = objectParamMapper.generateInsertString(object, 'users');
    expect(insertString.text).toBe('insert into users ( first_name , last_name , user_name , phone , email , password , tos_agreement , address , status , role , last_login , created_date , updated_date ) values ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *;');
    expect(insertString.values.length).toBe(13);
    expect(insertString.values[0]).toBe('pb');
    console.log(insertString);
  });

  it('object select mapper', () => {
    const insertString = objectParamMapper.generateSelectString({ firstName: 'testUpdate' }, { id: 'asc' }, 'users');
    expect(insertString.text).toBe('SELECT * FROM users  WHERE first_name = $1 ORDER BY id asc');
    expect(insertString.whereValues[0]).toBe('testUpdate');
    expect(insertString.orderValues[0]).toBe('asc');
    console.log(insertString);
  });

  it('object to sql re mapper', () => {
    const sqlObject = objectParamMapper.remapToSqlObject(object);
    console.log(sqlObject);
  });

  it('sql to object re mapper', () => {
    const sqlObject = objectParamMapper.remapToSqlObject(object);
    console.log(sqlObject);
    const jsObject = objectParamMapper.remapFromSqlObject(sqlObject);
    console.log(jsObject);
    expect(jsObject.firstName).toMatch(object.firstName);
  });
});
