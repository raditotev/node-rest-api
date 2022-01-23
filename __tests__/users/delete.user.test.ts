import request from 'supertest';
import app from 'app';
import User from 'models/user';

User.findById = jest.fn();
const mockDelete = jest.fn();
jest.mock('../../models/user', () => {
  return function () {
    return {
      remove: mockDelete,
    };
  };
});

const mockUserId = '61e05744a2f380b559cf40a7';

describe('DELETE /users/:id', () => {
  test('delete user', async () => {
    expect.assertions(3);

    User.findById.mockResolvedValueOnce(new User());

    const response = await request(app).delete(`/users/${mockUserId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toMatchInlineSnapshot(`"User removed"`);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  test('invalid user ID', async () => {
    expect.assertions(3);

    const invalidId = 'invalid-ID';

    const response = await request(app).delete(`/users/${invalidId}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatchInlineSnapshot(
      `"Provide user ID as a parameter: users/{user-id}"`
    );
    expect(User.findById).toHaveBeenCalledTimes(0);
  });

  test('non-existing user', async () => {
    expect.assertions(3);

    User.findById.mockResolvedValueOnce(null);

    const response = await request(app).delete(`/users/${mockUserId}`);

    expect(response.statusCode).toBe(422);
    expect(response.body.message).toMatchInlineSnapshot(
      `"Could not find user with this ID"`
    );
    expect(mockDelete).toHaveBeenCalledTimes(0);
  });
});
