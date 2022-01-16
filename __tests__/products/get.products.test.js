const request = require('supertest');
const app = require('../../app');
const Product = require('../../models/product');

Product.find = jest.fn();

describe.only('GET /products', () => {
  test('get products', async () => {
    expect.assertions(3);
    const mockProducts = [
      {
        _id: 'abc',
        name: 'test',
        price: 1.29,
      },
    ];
    Product.find.mockReturnValueOnce({
      select: () => Promise.resolve(mockProducts),
    });

    const response = await request(app).get('/products');
    expect(Product.find).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(200);
    expect(response.body.products).toEqual(mockProducts);
  });

  test('fail to get products', async () => {
    expect.assertions(2);

    const mockError = new Error('Failed');
    Product.find.mockReturnValueOnce({
      select: () => Promise.reject(mockError),
    });

    const response = await request(app).get('/products');

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe(mockError.message);
  });
});
