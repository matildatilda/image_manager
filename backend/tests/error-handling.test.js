const request = require('supertest');
const app = require('../src/app');

describe('Error Handling', () => {
  it('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  it('should handle POST to non-existent routes', async () => {
    const response = await request(app)
      .post('/api/non-existent')
      .send({ data: 'test' });
    
    expect(response.status).toBe(404);
  });

  it('should return proper JSON error format', async () => {
    const response = await request(app).get('/api/non-existent');
    
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('error');
    expect(typeof response.body.error).toBe('string');
  });
});