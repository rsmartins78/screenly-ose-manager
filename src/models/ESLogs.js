const client = require("./ESConn");
const { getTime } = require("../../lib/getTime");

module.exports = {
  async auditLogToElastic({data}) {
    const { user, action, message } = data
    const time = await getTime();
    const result = await client.index({
      index: "screenly-auditlog",
      type: "log",
      body: {
        timestamp: time,
        user: user,
        action: action,
        message: message
      }
    });
    return result;
  }
};
