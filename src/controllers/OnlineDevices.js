const dbclient = require("../models/ESDevices");
const request = require("request-promise-native");

module.exports = {
  async checkOnlineDevices() {
    const devices = await dbclient.listAllDevices();

    let devicesStatus = [];

    for (i in devices.hits.hits) {
      address = devices.hits.hits[i]._source.device_address;
      username = devices.hits.hits[i]._source.username;
      password = devices.hits.hits[i]._source.password;
      b64 = username + ":" + password;
      id = devices.hits.hits[i]._id;

      await request
        .get("http://" + address, {
          headers: {
            Authorization: "Basic " + Buffer.from(b64).toString("base64")
          },
          timeout: 10000
        })
        .then(async done => {
          devicesStatus.push({
            id: id,
            address: address,
            online: true
          });
        })
        .catch(async error => {
          devicesStatus.push({
            id: id,
            address: address,
            online: false
          });
        });
    }
  
    return devicesStatus;
  }
};
