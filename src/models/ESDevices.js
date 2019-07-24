const client = require("./ESConn.js");
const { getTime } = require("../../lib/getTime");

module.exports = {
  async addDevice(payload) {
    const time = await getTime();

    const response = client.index({
      index: "screenly",
      type: "raspberry",
      body: {
        device_name: payload.device_name,
        device_group: payload.device_group,
        device_address: payload.device_address,
        device_serial: payload.device_serial,
        device_type: payload.device_type,
        username: payload.username,
        password: payload.password,
        createdAt: time,
        lastCheckAt: time
      }
    });
    return response;
  },

  async listAllDevices() {

    var allRecords = [];

    const response = await client.search({
      index: "screenly",
      type: "raspberry",
      scroll: '30s',
      size: 10000,
      body: {
        query: {
          match_all: {}
        },
        sort: { "device_name.keyword": { order: "asc" } },
      }
    });

    function getMoreUntilDone(){
      response.hits.hits.forEach(function (hit){
        allRecords.push(hit)
      })
  
      if (response.hits.total !== allRecords.length) {
        // now we can call scroll over and over
        client.scroll({
          scrollId: response._scroll_id,
          scroll: '30s'
        }, getMoreUntilDone);
      } else {
        console.log('all done', allRecords);
      }
    }
    
    getMoreUntilDone();
    console.log(allRecords)
    return allRecords;
  },

  async searchById(query, group) {
    const response = await client.search({
      index: "screenly",
      type: "raspberry",
      body: {
        query: {
          match: {
            _id: query,
          }
        }
      }
    });
    return response;
  },
  async listAllPerGroup(group) {
    const response = await client.search({
      index: "screenly",
      type: "raspberry",
      body: {
        query: {
          match: {
            device_group: group
          }
        },
        sort: { "device_name.keyword": { order: "asc" } },
        size: -1
      }
    });
    return response;
  },

  async updateDevice(id, payload) {
    const time = await getTime();
    const response = client.update({
      index: "screenly",
      type: "raspberry",
      id,
      body: {
        doc: {
          device_name: payload.device_name,
          device_group: payload.device_group,
          device_address: payload.device_address,
          device_serial: payload.device_serial,
          device_type: payload.device_type,
          username: payload.username,
          password: payload.password,
          createdAt: time,
          lastCheckAt: time
        }
      }
    });
    return response;
  },

  async deleteDevice(id) {
    const response = client.delete({
      index: "screenly",
      id,
      type: "raspberry"
    });
    return response;
  }
};
