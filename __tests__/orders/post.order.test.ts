import request from 'supertest';
import app from '../../app';
import Product from '../../models/product';
import generateToken from '../helpers/jwt-token';

const mockedProduct = Product as jest.Mocked<typeof Product>;
mockedProduct.findById = jest.fn();
const mockSave = jest.fn();
const mockOrderConstructor = jest.fn();
jest.mock('../../models/order', () => {
  return function (order: any) {
    return {
      constructor: mockOrderConstructor,
      ...order,
      save: mockSave,
    };
  };
});

const token = generateToken();
const fakeOrder = {
  quantity: 2,
  pid: '61e188afc4d3175cc38c1811',
};
const fakeProduct = new Product({
  name: 'Test',
  price: 9,
});

describe('POST /orders/:id', () => {
  test('create order', async () => {
    expect.assertions(3);

    mockedProduct.findById.mockResolvedValueOnce(fakeProduct);

    const response = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer ' + token)
      .send(fakeOrder);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toMatchInlineSnapshot(`"Created new order"`);
    expect(response.body.order).toEqual(fakeOrder);
  });

  test('unauthenticated request', async () => {
    expect.assertions(3);

    const invalidToken = 'invalid-token';

    const response = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer ' + invalidToken)
      .send(fakeOrder);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatchInlineSnapshot(`"Unauthorized"`);
    expect(mockOrderConstructor).toHaveBeenCalledTimes(0);
  });

  test('invalid product ID', async () => {
    expect.assertions(3);

    const invalidProductId = 'invalid';

    const response = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer ' + token)
      .send({
        ...fakeOrder,
        pid: invalidProductId,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0].msg).toMatchInlineSnapshot(
      `"Invalid product ID"`
    );
    expect(mockOrderConstructor).toHaveBeenCalledTimes(0);
  });

  test('invalid quantity', async () => {
    expect.assertions(3);

    const response = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer ' + token)
      .send({
        ...fakeOrder,
        quantity: 0,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0].msg).toMatchInlineSnapshot(
      `"Please provide quantity value"`
    );
    expect(mockOrderConstructor).toHaveBeenCalledTimes(0);
  });

  test('non-existent product', async () => {
    expect.assertions(3);

    mockedProduct.findById.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer ' + token)
      .send(fakeOrder);

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toMatchInlineSnapshot(`"No product found"`);
    expect(mockSave).toHaveBeenCalledTimes(0);
  });

  test('failure to save order', async () => {
    expect.assertions(2);

    mockedProduct.findById.mockResolvedValueOnce(fakeProduct);
    const mockError = new Error('Mock error');
    mockSave.mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer ' + token)
      .send(fakeOrder);

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toEqual(mockError.message);
  });
});
