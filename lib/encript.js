const bcrypt = require('bcryptjs');

async function encryptData(data, numberOfRounds = 10) {
  const encryptedData = await bcrypt.hash(data, numberOfRounds);
  return encryptedData;
}

async function compareData(currentData, encryptedData) {
  return bcrypt.compare(currentData, encryptedData);
}

module.exports = {
  encryptData,
  compareData,
};
