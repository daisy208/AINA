const request = require('supertest');
const app = require('../app');

describe('Auth validation', () => {
  it('rejects invalid register payload', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'bad', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation error');
  });

  it('rejects invalid login payload', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(400);
  });
});
