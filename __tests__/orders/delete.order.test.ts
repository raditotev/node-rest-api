import request from 'supertest';
import app from '../../app';
import Order from '../../models/order';
import generateToken from '../helpers/jwt-token';

const mockedOrder = Order as jest.Mocked<typeof Order>;
mockedOrder.findById = jest.fn();
const mockRemove = jest.fn();
jest.mock('../../models/order', () => {
  return function () {
    return {
      remove: mockRemove,
    };
  };
});

const token = generateToken();
const mockOrderId = '61e188afc4d3175cc38c1811';

describe('DELETE /orders/:id', () => {
  test('delete order', async () => {
    expect.assertions(3);

    mockedOrder.findById.mockResolvedValueOnce(new Order());

    const response = await request(app)
      .delete(`/orders/${mockOrderId}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toMatchInlineSnapshot(
      `"DELETE order with id ${mockOrderId}"`
    );
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  test('unauthenticated request', async () => {
    expect.assertions(3);

    const invalidToken = 'invalid-token';

    const response = await request(app)
      .delete(`/orders/${mockOrderId}`)
      .set('Authorization', 'Bearer ' + invalidToken);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatchInlineSnapshot(`"Unauthorized"`);
    expect(mockedOrder.findById).toHaveBeenCalledTimes(0);
  });

  test('invalid ID', async () => {
    expect.assertions(3);

    const invalidOrderId = 'invalid';

    const response = await request(app)
      .delete(`/orders/${invalidOrderId}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatchInlineSnapshot(`"Invalid order ID"`);
    expect(mockedOrder.findById).toHaveBeenCalledTimes(0);
  });

  test('non-existent order', async () => {
    expect.assertions(3);

    mockedOrder.findById.mockResolvedValueOnce(null);

    const response = await request(app)
      .delete(`/orders/${mockOrderId}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toMatchInlineSnapshot(
      `"No order with this ID"`
    );
    expect(mockRemove).toHaveBeenCalledTimes(0);
  });

  test('failure to delete', async () => {
    expect.assertions(2);

    mockedOrder.findById.mockResolvedValueOnce(new Order());
    const mockError = new Error('Mock error');
    mockRemove.mockRejectedValueOnce(mockError);

    const response = await request(app)
      .delete(`/orders/${mockOrderId}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toEqual(mockError.message);
  });
});
