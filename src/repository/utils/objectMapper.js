const objectMapper = {
  generateUpdateString(setObjects, table, whereObject) {
    const sqlSetObject = objectMapper.remapToSqlObject(setObjects);
    const setObjectValuesArray = Object.values(sqlSetObject);
    const setObjectKeysArray = Object.keys(sqlSetObject);

    let updateString = `update ${table} SET `;
    for (let i = 0; i < setObjectKeysArray.length; i++) {
      if (i !== 0) {
        updateString += `, ${setObjectKeysArray[i]} = ${objectMapper.stringifyValues(setObjectValuesArray[i])}`;
      } else {
        updateString += ` ${setObjectKeysArray[i]} = ${objectMapper.stringifyValues(setObjectValuesArray[i])}`;
      }
    }

    updateString = `${updateString} where `;
    const sqlWhereObject = objectMapper.remapToSqlObject(whereObject);
    const whereObjectValuesArray = Object.values(sqlWhereObject);
    const wehreObjectKeysArray = Object.keys(sqlWhereObject);
    for (let i = 0; i < wehreObjectKeysArray.length; i++) {
      if (i !== 0) {
        updateString += ` AND ${wehreObjectKeysArray[i]} = ${objectMapper.stringifyValues(whereObjectValuesArray[i])}`;
      } else {
        updateString += `${wehreObjectKeysArray[i]} = ${objectMapper.stringifyValues(whereObjectValuesArray[i])}`;
      }
    }
    return `${updateString};`;
  },
  generateInsertString(object, table) {
    const sqlObject = objectMapper.remapToSqlObject(object);
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
        insertString += `, ${objectMapper.stringifyValues(objectValuesArray[i])}`;
      } else {
        insertString += ` ${objectMapper.stringifyValues(objectValuesArray[i])}`;
      }
    }
    return `${insertString});`;
  },
  generateSelectString(whereObject, orderByObject, table) {
    if (!whereObject) {
      return `select * from ${table}`;
    }
    const sqlWhereObject = objectMapper.remapToSqlObject(whereObject);
    const sqlOrderByObject = objectMapper.remapToSqlObject(orderByObject);
    const objectValuesArray = Object.values(sqlWhereObject);
    const objectKeysArray = Object.keys(sqlWhereObject);
    const orderObjectValuesArray = Object.values(sqlOrderByObject);
    const orderObjectKeysArray = Object.keys(sqlOrderByObject);

    let selectString = `SELECT * FROM ${table} `;
    for (let i = 0; i < objectKeysArray.length; i++) {
      if (i === 0) {
        selectString += ` WHERE ${objectKeysArray[i]} = ${objectMapper.stringifyValues(
          objectValuesArray[i],
        )}`;
      } else {
        selectString += ` AND ${objectKeysArray[i]} = ${objectMapper.stringifyValues(
          objectValuesArray[i],
        )}`;
      }
    }
    for (let i = 0; i < orderObjectKeysArray.length; i++) {
      if (i === 0) {
        selectString += ` ORDER BY ${orderObjectKeysArray[i]}  ${orderObjectValuesArray[i]}`;
      } else {
        selectString += ` AND ${orderObjectKeysArray[i]} = ${orderObjectValuesArray[i]}`;
      }
    }
    return `${selectString};`;
  },
  stringifyValues(value) {
    if (value && value instanceof Date) return `'${value.toISOString()}'`;
    if (typeof value === 'undefined') return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return `'${value}'`;
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

module.exports = objectMapper;
