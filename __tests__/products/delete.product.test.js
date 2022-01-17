const request = require('supertest');
const app = require('../../app');
const Product = require('../../models/product');
const generateToken = require('../helpers/jwt-token');

Product.findById = jest.fn();
const mockRemove = jest.fn();
jest.mock('../../models/product', () => {
  return function () {
    return {
      remove: mockRemove,
    };
  };
});

const token = generateToken();
const mockProductId = '61e05744a2f380b559cf40a7';
const product = {
  name: 'Apples',
  price: 1.29,
};

describe('DELETE /products/:id', () => {
  test('delete file', async () => {
    expect.assertions(3);

    Product.findById.mockResolvedValueOnce(new Product(product));

    const response = await request(app)
      .delete(`/products/${mockProductId}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toMatchInlineSnapshot(`"Product deleted"`);
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  test('unauthenticated request', async () => {
    expect.assertions(3);

    const invalidToken = 'invalid-token';

    const response = await request(app)
      .delete(`/products/${mockProductId}`)
      .set('Authorization', 'Bearer ' + invalidToken);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatchInlineSnapshot(`"Unauthorized"`);
    expect(Product.findById).toHaveBeenCalledTimes(0);
  });

  test('invalid params', async () => {
    expect.assertions(3);

    const invalidProductId = 'invalid';

    const response = await request(app)
      .delete(`/products/${invalidProductId}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatchInlineSnapshot(`"Invalid product ID"`);
    expect(Product.findById).toHaveBeenCalledTimes(0);
  });

  test('invalid ID', async () => {
    expect.assertions(3);

    Product.findById.mockResolvedValueOnce(null);

    const response = await request(app)
      .delete(`/products/${mockProductId}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toMatchInlineSnapshot(
      `"This product ID does not exists"`
    );
    expect(mockRemove).toHaveBeenCalledTimes(0);
  });

  test('failure to delete file', async () => {
    expect.assertions(2);

    Product.findById.mockResolvedValueOnce(new Product(product));
    const mockError = new Error('Mock error');
    mockRemove.mockRejectedValueOnce(mockError);

    const response = await request(app)
      .delete(`/products/${mockProductId}`)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe(mockError.message);
  });
});