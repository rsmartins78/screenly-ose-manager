const dbclient = require("../models/ESDevices");
const request = require("request-promise-native");

module.exports = {
  async checkOnlineDevices() {
    const devices = await dbclient.listAllDevices();

    let devicesStatus = [];

    for (i in devices.hits.hits) {
      address = devices.hits.hits[i]._source.device_address;
      host = address.split(":")[0];
      port = address.split(":")[1];
      username = devices.hits.hits[i]._source.username;
      password = devices.hits.hits[i]._source.password;
      b64 = username + ":" + password;
      id = devices.hits.hits[i]._id;

      const response = await request.get("http://" + address, {
        headers: {
          Authorization: "Basic " + Buffer.from(b64).toString('base64')
        }, timeout: 3000
      });
      if (!response.statusCode) {
        online = await devicesStatus.push({
          id: id,
          address: address,
          online: true
        });
      } else {
        online = await devicesStatus.push({
          id: id,
          address: address,
          online: false
        });
      }
      // const online = await isReachable('http://' + username + ':' + password + '@' + address);
    }

    // console.log(devicesStatus)
    return devicesStatus;
  }
};
