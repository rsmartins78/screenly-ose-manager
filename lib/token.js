const jwt = require('jsonwebtoken');

const secret = process.env.SECRET || '123456';

async function generateToken(userData) {
  const { userId, user, group } = userData;
  const token = await jwt.sign(
    {
      userId,
      user,
      group,
    },
    secret,
    {
      expiresIn: '8hr',
    },
  );

  return token;
}

async function validateToken(token) {
  let result;

  await jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      result = {
        success: false,
        ...decoded,
      };
    } else {
      result = {
        success: true,
        ...decoded,
      };
    }
  });

  return result;
}

module.exports = {
  generateToken,
  validateToken,
};
