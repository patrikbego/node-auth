const request = require('supertest');
const server = require('../../app');
const mockObjects = require('../mockObjects');
const mailgunService = require('../service/mailgunService');
const db = require('../repository/db-migrate');

describe('Auth router test', () => {
  jest.setTimeout(30000);
  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async (done) => {
    await db.migrate.rollback();
    await db.destroy();
    console.log('Migrating down');
    done();
  });

  it('Mock mail signup router test', async (done) => {
    const jwtSpy = jest.spyOn(mailgunService, 'sendEmail');
    jwtSpy.mockReturnValue('Some test email');

    request(server)
      .post('/api/v1/auth/signup')
      .send(mockObjects.user)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe('Please confirm email');
        return done();
      });
  });

  it('Mock mail invalid credentials signup router test', async () => {
    const jwtSpy = jest.spyOn(mailgunService, 'sendEmail');
    jwtSpy.mockImplementationOnce(() => {
      throw new Error('Invalid credentials');
    });

    const res = await request(server)
      .post('/api/v1/auth/signup')
      .send(mockObjects.user)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/);

    expect(res.status).toEqual(400);
  });
});
