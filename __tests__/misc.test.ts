import request from 'supertest';
import app from '../app';

test('GET /status', async () => {
  const response = await request(app).get('/status');

  expect(response.statusCode).toBe(200);
  expect(response.text).toMatchInlineSnapshot(`"Server up and running"`);
});

test('non-existent endpoint', async () => {
  const response = await request(app).get('/non-existent-endpoint');

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toMatchInlineSnapshot(`"Not Found"`);
});
