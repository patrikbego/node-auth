const request = require('supertest');
const db = require('../repository/db-migrate');
const mockObjects = require('../mockObjects');
const server = require('../../bin/www');
const mailgunService = require('../service/mailgunService');

describe('User router test', () => {
  jest.setTimeout(3000000);

  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async (done) => {
    await db.migrate.rollback();
    await db.destroy();
    console.log('Migrating down');
    done();
  });

  it('Blog endpoints test', async (done) => {
    // const jwtSpy = jest.spyOn(tokenService, 'isRequestTokenValid');
    // jwtSpy.mockReturnValue(true);

    const jwtMailSpy = jest.spyOn(mailgunService, 'sendEmail');
    jwtMailSpy.mockReturnValue('Some test email');

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
          .set('Authorization', 'Basic YXRlc3RAYXRlc3QuY29tOnBhc3MxMjM=')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            cookie = res.headers['set-cookie'][0];
            // expect(res.body.token).toBeTruthy();
            mockObjects.user.lastName = 'testio';

            request(server)
              .post('/api/v1/blog/createBlog')
              .send(mockObjects.blog)
              .set('Accept', 'application/json')
              .set('cookie', cookie)
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                expect(res.body[0].body).toContain('###### Heading level 6');
                mockObjects.blog.id = 1;

                request(server)
                  .get('/api/v1/blog/getBlog')
                  .send({ query: 'Test' })
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .set('cookie', cookie)
                  .expect(200)
                  .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body[0].body).toContain('###### Heading level 6');
                    server.close(done);
                    return done();
                  });
              });
          });
      });
  });
});
