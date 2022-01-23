const request = require('supertest');
const app = require('../../app');
const Order = require('../../models/order');
const generateToken = require('../helpers/jwt-token');

Order.findById = jest.fn();

const token = generateToken();
const mockOrder = {
  _id: '61e578eb2a382ad1ca95bf31',
  quantity: 2,
  pid: '61e188afc4d3175cc38c1811',
};

describe('GET /order/:id', () => {
  test('get order', async () => {
    expect.assertions(3);

    Order.findById.mockResolvedValueOnce(mockOrder);

    const response = await request(app)
      .get(`/orders/${mockOrder._id}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toMatchInlineSnapshot(
      `"GET order with id ${mockOrder._id}"`
    );
    expect(response.body.order).toEqual(mockOrder);
  });

  test('unauthenticated request', async () => {
    expect.assertions(3);

    const invalidToken = 'invalid-token';

    const response = await request(app)
      .get(`/orders/${mockOrder._id}`)
      .set('Authorization', 'Bearer ' + invalidToken);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatchInlineSnapshot(`"Unauthorized"`);
    expect(Order.findById).toHaveBeenCalledTimes(0);
  });

  test('invalid ID', async () => {
    expect.assertions(3);
    const invalidOrderId = 'invalid';

    const response = await request(app)
      .get(`/orders/${invalidOrderId}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatchInlineSnapshot(`"Invalid order ID"`);
    expect(Order.findById).toHaveBeenCalledTimes(0);
  });

  test('non-existent order', async () => {
    expect.assertions(2);

    Order.findById.mockResolvedValueOnce(null);

    const response = await request(app)
      .get(`/orders/${mockOrder._id}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toMatchInlineSnapshot(
      `"No order with this ID"`
    );
  });
});
