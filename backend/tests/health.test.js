const request = require('supertest');
const app = require('../src/app');

describe('Health Check API', () => {
  it('GET /health should return 200 and healthy status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });

  it('GET /health response should have correct structure', async () => {
    const response = await request(app).get('/health');
    
    expect(typeof response.body.status).toBe('string');
    expect(typeof response.body.timestamp).toBe('string');
    expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});