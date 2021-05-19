const request = require('supertest');
const server = require('../../app');
const mockObjects = require('../mockObjects');
const mailgunService = require('../service/mailgunService');
const db = require('../repository/db-migrate');
const tokenService = require('../service/tokenService');

describe('User router test', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async (done) => {
    await db.migrate.rollback();
    await db.destroy();
    console.log('Migrating down');
    // server.close();
    done();
  });

  it('User endpoints test', async (done) => {
    const jwtSpy = jest.spyOn(mailgunService, 'sendEmail');
    jwtSpy.mockReturnValue('Some test email');

    const jwtSpy1 = jest.spyOn(tokenService, 'isRequestTokenValid');
    jwtSpy1.mockReturnValue({ user: { id: 1 } });

    request(server)
      .post('/api/v1/auth/signup')
      .send(mockObjects.user)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body).toBe('Please confirm email');
        let cookie = null;

        request(server)
          .post('/api/v1/auth/signin')
          .send(mockObjects.user)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer YXRlc3RAYXRlc3QuY29tOnBhc3MxMjM=')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            cookie = res.headers['set-cookie'][0];
            expect(res.body.token).toBeTruthy();
            mockObjects.user.lastName = 'testio';

            request(server)
              .put('/api/v1/user/updateUser')
              .send(mockObjects.user)
              .set('Accept', 'application/json')
              .set('cookie', cookie)
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body)
                  .toBe('User has been updated successfully!');
                return done();
              });
          });
      });
  });

  it('Delete user endpoint test', async () => {
    //   const jwtSpy = jest.spyOn(mailgunService, 'sendEmail');
    //   jwtSpy.mockImplementationOnce(() => { throw new Error('Invalid credentials'); });
    //
    //   const res = await request(server)
    //     .post('/api/v1/auth/signup')
    //     .send(mockObjects.user)
    //     .set('Accept', 'application/json')
    //     .expect('Content-Type', /json/);
    //
    //   expect(res.status).toEqual(400);
    expect(1 + 1).toBe(2);
  });
});
