import request from 'supertest';
import app from '../../app';
import Product from '../../models/product';

jest.mock('../../models/product', () => {
  return function (product: any) {
    return {
      ...product,
    };
  };
});
const mockedProduct = Product as jest.Mocked<typeof Product>;
mockedProduct.findById = jest.fn();

const mockProduct = {
  _id: '61e05744a2f380b559cf40a7',
  name: 'apples',
  price: 1.29,
};

describe('GET /product/:id', () => {
  test('fetch product successfully', async () => {
    expect.assertions(4);

    mockedProduct.findById.mockReturnValueOnce({
      select: () => Promise.resolve(mockProduct),
    } as any);

    const response = await request(app).get(`/products/${mockProduct._id}`);

    expect(mockedProduct.findById).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      `Get product with an ID ${mockProduct._id}`
    );
    expect(response.body.product).toEqual(mockProduct);
  });

  test('invalid params', async () => {
    expect.assertions(3);

    const invalidParams = 'invalid-param';
    const response = await request(app).get('/products/' + invalidParams);

    expect(Product.findById).toHaveBeenCalledTimes(0);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatchInlineSnapshot(`"Invalid product ID"`);
  });
  test('missing product', async () => {
    expect.assertions(2);

    mockedProduct.findById.mockReturnValueOnce({
      select: () => Promise.resolve(null),
    } as any);

    const response = await request(app).get(`/products/${mockProduct._id}`);

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe('This product ID does not exists');
  });
  test('server error', async () => {
    expect.assertions(2);

    const mockError = new Error('Failed');
    mockedProduct.findById.mockReturnValueOnce({
      select: () => Promise.reject(mockError),
    } as any);

    const response = await request(app).get(`/products/${mockProduct._id}`);

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe(mockError.message);
  });
});
