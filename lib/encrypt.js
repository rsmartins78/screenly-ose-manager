const bcrypt = require("bcryptjs");

module.exports = {
  async encryptData(data, numberOfRounds = 10) {
    const encryptedData = await bcrypt.hash(data, numberOfRounds);
    return encryptedData;
  },
  async compareData(currentData, encryptedData) {
    return bcrypt.compare(currentData, encryptedData);
  }
};
