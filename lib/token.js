const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

async function generateToken(userData) {
  const { id, username, userType } = userData;
  const token = await jwt.sign(
    {
      id,
      username,
      userType,
    },
    secret,
    {
      expiresIn: '1hr',
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
