const request = require('supertest');
const app = require('../../app');
const generateToken = require('../helpers/jwt-token');
const Product = require('../../models/product');

Product.findById = jest.fn();
const mockSave = jest.fn();
jest.mock('../../models/product', () => {
  return function () {
    return {
      save: mockSave,
    };
  };
});

const token = generateToken();
const mockProductId = '61e05744a2f380b559cf40a7';
const existingProduct = {
  name: 'Apples',
  price: 1.29,
};
const updatedProduct = {
  name: 'Pears',
  price: 1.89,
};

describe('PATCH /products/:id', () => {
  test('update product', async () => {
    expect.assertions(3);

    Product.findById.mockResolvedValueOnce(new Product(existingProduct));

    const response = await request(app)
      .patch(`/products/${mockProductId}`)
      .set('Authorization', 'Bearer ' + token)
      .send(updatedProduct);

    expect(response.statusCode).toBe(200);
    expect(response.body.product).toEqual(updatedProduct);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  test('unauthenticated request', async () => {
    expect.assertions(3);

    const invalidToken = 'invalid-token';
    const response = await request(app)
      .patch(`/products/${mockProductId}`)
      .set('Authorization', 'Bearer ' + invalidToken)
      .send(updatedProduct);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatchInlineSnapshot(`"Unauthorized"`);
    expect(Product.findById).toHaveBeenCalledTimes(0);
  });

  test('invalid params', async () => {
    expect.assertions(3);

    const invalidParam = 'invalid-id';

    const response = await request(app)
      .patch(`/products/${invalidParam}`)
      .set('Authorization', 'Bearer ' + token)
      .send(updatedProduct);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatchInlineSnapshot(`"Invalid product ID"`);
    expect(Product.findById).toHaveBeenCalledTimes(0);
  });

  test('invalid product id', async () => {
    expect.assertions(2);

    Product.findById.mockResolvedValueOnce(null);

    const response = await request(app)
      .patch(`/products/${mockProductId}`)
      .set('Authorization', 'Bearer ' + token)
      .send(updatedProduct);

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toMatchInlineSnapshot(
      `"This product ID does not exists"`
    );
  });

  test('failure to save updates', async () => {
    expect.assertions(2);

    Product.findById.mockResolvedValueOnce(new Product(updatedProduct));
    const mockError = new Error('Mock error');
    mockSave.mockRejectedValue(mockError);

    const response = await request(app)
      .patch(`/products/${mockProductId}`)
      .set('Authorization', 'Bearer ' + token)
      .send(updatedProduct);

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe(mockError.message);
  });
});