import request from 'supertest';
import app from 'app';
import Order from 'models/order';
import generateToken from '../helpers/jwt-token';

Order.find = jest.fn();

const token = generateToken();
const mockOrders = [
  {
    _id: '61e578eb2a382ad1ca95bf31',
    quantity: 2,
    pid: '61e188afc4d3175cc38c1811',
  },
  {
    _id: '61e578eb2a382ad1ca95bf33',
    quantity: 1,
    pid: '61e188afc4d3175cc38c1822',
  },
];

describe('GET /orders', () => {
  test('get orders', async () => {
    expect.assertions(3);

    Order.find.mockResolvedValueOnce(mockOrders);

    const response = await request(app)
      .get('/orders')
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toMatchInlineSnapshot(`"GET all orders"`);
    expect(response.body.orders).toEqual(mockOrders);
  });

  test('unauthenticated request', async () => {
    expect.assertions(3);

    const invalidToken = 'invalid-token';

    const response = await request(app)
      .get('/orders')
      .set('Authorization', 'Bearer ' + invalidToken);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatchInlineSnapshot(`"Unauthorized"`);
    expect(Order.find).toHaveBeenCalledTimes(0);
  });

  test('db failure', async () => {
    expect.assertions(2);

    const mockError = new Error('Mock error');
    Order.find.mockRejectedValueOnce(mockError);

    const response = await request(app)
      .get('/orders')
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe(mockError.message);
  });
});
