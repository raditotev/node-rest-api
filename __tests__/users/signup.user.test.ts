import request from 'supertest';
import app from 'app';
import User from 'models/user';

const mockSave = jest.fn();
jest.mock('../../models/user', () => {
  return function () {
    return {
      save: mockSave,
    };
  };
});
User.findOne = jest.fn();

const mockUser = {
  email: 'test@test.com',
  password: '123123',
};

describe('POST /users/signup', () => {
  test('create user', async () => {
    expect.assertions(3);

    User.findOne.mockResolvedValueOnce(null);

    const response = await request(app).post('/users/signup').send(mockUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toMatchInlineSnapshot(`"New user created"`);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  test('missing inputs', async () => {
    expect.assertions(3);

    const response = await request(app).post('/users/signup');

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "location": "body",
          "msg": "Please enter valid email",
          "param": "email",
          "value": "@",
        },
        Object {
          "location": "body",
          "msg": "Password should be at least 6 characters long ",
          "param": "password",
        },
      ]
    `);
    expect(User.findOne).toHaveBeenCalledTimes(0);
  });

  test('existing user', async () => {
    expect.assertions(3);

    User.findOne.mockResolvedValueOnce(mockUser);

    const response = await request(app).post('/users/signup').send(mockUser);

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toMatchInlineSnapshot(
      `"User with this email already exists"`
    );
    expect(mockSave).toHaveBeenCalledTimes(0);
  });

  test('failure to create user', async () => {
    expect.assertions(2);

    User.findOne.mockResolvedValueOnce(null);
    const mockError = new Error('Mock error');
    mockSave.mockRejectedValueOnce(mockError);

    const response = await request(app).post('/users/signup').send(mockUser);

    expect(response.statusCode).toBe(502);
    expect(response.body.message).toBe(mockError.message);
  });
});
