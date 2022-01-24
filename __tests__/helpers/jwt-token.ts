import jwt from 'jsonwebtoken';

export default () => {
  const payload = {
    userId: '61e05744a2f380b559cf40a7',
    email: 'test@example.com',
  };

  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};
