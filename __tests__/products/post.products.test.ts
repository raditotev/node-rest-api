import fs from 'fs/promises';
import { uploadBytes, getDownloadURL } from 'firebase/storage';

import request from 'supertest';
import app from 'app';
import generateToken from '../helpers/jwt-token';

jest.mock('../../firestore', () => jest.fn());
jest.mock('firebase/storage', () => {
  return {
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
  };
});

const mockSave = jest.fn();
jest.mock('../../models/product', () => {
  return function () {
    return {
      save: mockSave,
    };
  };
});

fs.readFile = jest.fn();

const token = generateToken();
const mockError = new Error('Mock error');
const product = {
  name: 'Apples',
  price: 1.29,
  imageURL: 'mock/image/url',
};

describe('POST /products', () => {
  test('create product', async () => {
    expect.assertions(5);

    uploadBytes.mockResolvedValueOnce({ ref: '' });
    getDownloadURL.mockResolvedValueOnce(product.imageURL);

    const response = await request(app)
      .post('/products')
      .set('Authorization', 'Bearer ' + token)
      .field('name', product.name)
      .field('price', product.price)
      .attach('image', '__tests__/fixures/test.jpeg');

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toMatchInlineSnapshot(
      `"Created a new product"`
    );
    expect(response.body.product).toEqual(product);

    const files = await fs.readdir('tmp/');
    try {
      expect(files).toHaveLength(0);
    } catch (error) {
      throw new Error(
        'Image file should be removed from disk after it has been uploaded'
      );
    }
  });

  test('unauthenticated request', async () => {
    expect.assertions(3);

    const invalidToken = 'invalid-token';
    const response = await request(app)
      .post('/products')
      .set('Authorization', 'Bearer ' + invalidToken);

    expect(mockSave).toHaveBeenCalledTimes(0);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatchInlineSnapshot(`"Unauthorized"`);
  });

  test('missing input fields', async () => {
    expect.assertions(5);

    const noPriceResponse = await request(app)
      .post('/products')
      .send({ name: product.name })
      .set('Authorization', 'Bearer ' + token);
    expect(noPriceResponse.statusCode).toBe(400);

    const noNameResponse = await request(app)
      .post('/products')
      .send({ price: product.price })
      .set('Authorization', 'Bearer ' + token);
    expect(noNameResponse.statusCode).toBe(400);

    const missingInputs = await request(app)
      .post('/products')
      .set('Authorization', 'Bearer ' + token);
    expect(missingInputs.statusCode).toBe(400);
    expect(missingInputs.body.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "location": "body",
            "msg": "Please provide product name",
            "param": "name",
          },
          Object {
            "location": "body",
            "msg": "Please provide product price",
            "param": "price",
          },
        ]
    `);
    expect(mockSave).toHaveBeenCalledTimes(0);
  });

  test('failure to upload file', async () => {
    expect.assertions(3);

    fs.readFile.mockRejectedValue(mockError);

    const response = await request(app)
      .post('/products')
      .set('Authorization', 'Bearer ' + token)
      .field('name', product.name)
      .field('price', product.price)
      .attach('image', '__tests__/fixures/test.jpeg');

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe(mockError.message);
    expect(mockSave).toHaveBeenCalledTimes(0);
  });

  test('failure to create a product', async () => {
    expect.assertions(2);

    mockSave.mockRejectedValue(mockError);

    const response = await request(app)
      .post('/products')
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'test', price: 1 });

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe(mockError.message);
  });
});
