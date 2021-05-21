const objectParamMapper = {
  // const text = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *'
  // const values = ['brianc', 'brian.m.carlson@gmail.com']

  generateUpdateString(setObjects, whereObject, table) {
    const sqlSetObject = objectParamMapper.remapToSqlObject(setObjects);
    const setObjectValuesArray = Object.values(sqlSetObject);
    const setObjectKeysArray = Object.keys(sqlSetObject);

    let updateString = `update ${table} SET `;
    let i = 0;
    for (; i < setObjectKeysArray.length; i++) {
      if (i !== 0) {
        updateString += `, ${setObjectKeysArray[i]} = $${i + 1}`;
      } else {
        updateString += ` ${setObjectKeysArray[i]} = $${i + 1}`;
      }
    }

    updateString = `${updateString} where `;
    const sqlWhereObject = objectParamMapper.remapToSqlObject(whereObject);
    const whereObjectValuesArray = Object.values(sqlWhereObject);
    const whereObjectKeysArray = Object.keys(sqlWhereObject);
    for (let j = 0; j < whereObjectKeysArray.length; j++) {
      if (j !== 0) {
        updateString += ` AND ${whereObjectKeysArray[j]} = $${i + 1} `;
      } else {
        updateString += `${whereObjectKeysArray[j]} = $${i + 1} `;
      }
    }
    return {
      text: updateString,
      whereValues: whereObjectValuesArray.map(
        (x) => objectParamMapper.stringifyValues(x),
      ),
      setValues: setObjectValuesArray.map(
        (x) => objectParamMapper.stringifyValues(x),
      ),
    };
  },
  generateInsertString(object, table) {
    const sqlObject = objectParamMapper.remapToSqlObject(object);
    const objectValuesArray = Object.values(sqlObject);
    const objectKeysArray = Object.keys(sqlObject);

    let insertString = `insert into ${table} (`;
    for (let i = 0; i < objectKeysArray.length; i++) {
      if (i !== 0) {
        insertString += `, ${objectKeysArray[i]} `;
      } else {
        insertString += ` ${objectKeysArray[i]} `;
      }
    }
    insertString = `${insertString}) values (`;
    for (let i = 0; i < objectKeysArray.length; i++) {
      if (i !== 0) {
        insertString += `, $${i + 1}`;
      } else {
        insertString += ` $${i + 1}`;
      }
    }
    return {
      text: `${insertString}) RETURNING *;`,
      values: objectValuesArray.map((x) => objectParamMapper.stringifyValues(x)),
    };
  },
  generateSelectString(whereObject, orderByObject, table) {
    if (!whereObject) {
      return { text: `select * from ${table}` };
    }
    const sqlWhereObject = objectParamMapper.remapToSqlObject(whereObject);
    const sqlOrderByObject = objectParamMapper.remapToSqlObject(orderByObject);
    const objectValuesArray = Object.values(sqlWhereObject);
    const objectKeysArray = Object.keys(sqlWhereObject);
    const orderObjectValuesArray = Object.values(sqlOrderByObject);
    const orderObjectKeysArray = Object.keys(sqlOrderByObject);

    let selectString = `SELECT * FROM ${table} `;
    let i = 0;
    for (; i < objectKeysArray.length; i++) {
      if (i === 0) {
        selectString += ` WHERE ${objectKeysArray[i]} = $${i + 1}`;
      } else {
        selectString += ` AND ${objectKeysArray[i]} = $${i + 1}`;
      }
    }
    for (let j = 0; j < orderObjectKeysArray.length; j++) {
      const orderDir = orderObjectValuesArray[i] === 'desc' ? 'desc' : 'asc';
      if (j === 0) {
        selectString += ` ORDER BY ${orderObjectKeysArray[j]} ${orderDir}`;
      } else {
        selectString += ` AND ${orderObjectKeysArray[j]} ${orderDir}`;
      }
    }
    return {
      text: `${selectString}`,
      whereValues: objectValuesArray.map(
        (x) => objectParamMapper.stringifyValues(x),
      ),
      orderValues: orderObjectValuesArray.map(
        (x) => objectParamMapper.stringifyValues(x),
      ),
    };
  },
  stringifyValues(value) {
    if (value && value instanceof Date) return `'${value.toISOString()}'`;
    if (typeof value === 'undefined') return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return `${value}`;
    if (value === null) return null;
    if (typeof value === 'bigint' || typeof value === 'symbol'
        || typeof value === 'object') return value;
    // case new Object, new Array, new Map, new Set, new WeakMap, new WeakSet, new Date null
    if (typeof value === 'function' || typeof value === 'object') return value;

    throw Error('Type not supported');
  },
  remapToSqlObject(object) {
    const newObject = {};
    if (object) {
      const objectValuesArray = Object.values(object);
      const objectKeysArray = Object.keys(object);
      let newKey = '';
      for (let i = 0; i < objectKeysArray.length; i++) {
        const key = objectKeysArray[i];
        let position = null;
        for (let j = 0; j < key.length; j++) {
          if (key[j].match(/[A-Z]/) != null) {
            position = j;
            break;
          }
        }
        if (position) {
          newKey = `${key.slice(0, position)}_${key.slice(position, key.length)
            .toLowerCase()}`;
        } else {
          newKey = key;
        }
        newObject[newKey] = objectValuesArray[i];
      }
    }
    return newObject;
  },
  remapFromSqlObject(object) {
    const objectValuesArray = Object.values(object);
    const objectKeysArray = Object.keys(object);
    const newObject = {};
    let newKey = '';
    for (let i = 0; i < objectKeysArray.length; i++) {
      const key = objectKeysArray[i];
      let position = null;
      for (let j = 0; j < key.length; j++) {
        if (key[j] === '_') {
          position = j;
          break;
        }
      }
      if (position) {
        const secondPart = key.slice(position + 1, key.length);
        newKey = `${key.slice(0, position)}${secondPart.charAt(0).toUpperCase()
        + secondPart.slice(1)}`;
      } else {
        newKey = key;
      }
      newObject[newKey] = objectValuesArray[i];
    }
    return newObject;
  },
};

module.exports = objectParamMapper;
