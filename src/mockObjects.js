const testObject = {
  user: {
    firstName: 'pb',
    lastName: null,
    phone: '123123123123',
    email: 'atest@atest.com',
    password: 'pass123',
    tosAgreement: true,
    address: undefined,
    status: 'new',
    role: 'user',
    lastLogin: new Date(),
    createdDate: new Date(),
    updatedDate: new Date(),
  },
  token: {
    user_id: 1,
    token: 'djv3kgm99o5c9cku2b5b',
    phone: '123123123123',
    status: 'new',
    expires: Date.now() + 6000,
    createdDate: new Date(),
    updatedDate: new Date(),
  },
  auth: {
    tokenId: 1,
    userId: 1,
    confirmationLink: `http://localhost:3000/${this.token}`,
    loginRetry: 0,
    loginIp: '127.0.0.1',
    createdDate: new Date(),
    updatedDate: null,
    status: 'new',
  },
  blog: {
    userId: 1,
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
};

module.exports = testObject;
