const testObject = {
  user: {
    firstName: 'pb',
    lastName: null,
    userName: 'pb',
    phone: '123123123123',
    email: 'atest@atest.com',
    password: 'pass123',
    tosAgreement: true,
    address: undefined,
    status: 'NEW',
    role: 'user',
    lastLogin: new Date(),
    createdDate: new Date(),
    updatedDate: new Date(),
  },
  token: {
    user_id: 1,
    token: 'djv3kgm99o5c9cku2b5b',
    phone: '123123123123',
    status: 'NEW',
    expires: Date.now() + 6000,
    createdDate: new Date(),
    updatedDate: new Date(),
  },
  auth: {
    tokenId: 1,
    // userId: 1, // parsed from cookie
    confirmationLink: `http://localhost:3000/${this.token}`,
    loginRetry: 0,
    loginIp: '127.0.0.1',
    createdDate: new Date(),
    updatedDate: null,
    status: 'NEW',
  },
  blog: {
    // userId: 1, // parsed from cookie
    language: 'EN',
    original: 'EN',
    title: 'Test Title',
    body: '\n'
        + '# Heading level 1\n'
        + '\n'
        + '\n'
        + '...\n'
        + '\n'
        + '###### Heading level 6\n',
    tags: 'test foo bar',
    published: true,
    status: 'PUBLISHED',
    created_date: new Date(),
    updated_date: new Date(),
  },
  profile: {
    provider: 'facebook',
    id: '10219365682069042',
    displayName: 'Patrik test',
    name: { familyName: 'test', givenName: 'Patrik', middleName: '' },
    gender: '',
    emails: [{ value: 'patrik.test@test.com' }],
    photos: [
      {
        value: 'https://graph.facebook.com/v2.6/102193636820369042/picture?type=large',
      },
    ],
    _raw: '{"id":"1021936368239042","email":"patrik.test\\u0040gmail.com","last_name":"test","first_name":"Patrik","name":"Patrik test"}',
    _json: {
      id: '1021936568249042',
      email: 'patrik.test@gmail.com',
      last_name: 'test',
      first_name: 'Patrik',
      name: 'Patrik test',
    },
  },

};

module.exports = testObject;
