import request from 'supertest';
import app from '../../app';
import Product from '../../models/product';

const mockedProduct = Product as jest.Mocked<typeof Product>;
mockedProduct.find = jest.fn();

describe.only('GET /products', () => {
  test('get products', async () => {
    expect.assertions(3);

    const mockProducts = [
      {
        _id: '123',
        name: 'Apple',
        price: 1.29,
      },
      {
        _id: '234',
        name: 'Pear',
        price: 1.69,
      },
      {
        _id: '345',
        name: 'Orange',
        price: 0.99,
      },
    ];
    mockedProduct.find.mockReturnValueOnce({
      select: () => Promise.resolve(mockProducts),
    } as any);

    const response = await request(app).get('/products');

    expect(Product.find).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(200);
    expect(response.body.products).toEqual(mockProducts);
  });

  test('fail to get products', async () => {
    expect.assertions(2);

    const mockError = new Error('Failed');
    mockedProduct.find.mockReturnValueOnce({
      select: () => Promise.reject(mockError),
    } as any);

    const response = await request(app).get('/products');

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe(mockError.message);
  });
});
