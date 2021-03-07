const request = require('supertest');
const server = require('../app');

describe('Test items router ', () => {
  afterAll(async (done) => {
    // close server conection
    // server.close();
    done();
  });
  it('Items router test', async (done) => {
    request(server)
      .get('/api/v1/getItems')
      .expect('Content-Type', /json/)
      .expect('Content-Length', '596')
      .expect(200)
      .end((err, res) => {
        expect(res.body[0].title).toBe('Free');
        if (err) throw err;
        done();
      });
  });
});
