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
    let responseAll = {};
    responseAll["hits"] = {};
    responseAll.hits.hits = [];
    const responseQueue = [];

    responseQueue.push(
      await client.search({
        index: "screenly",
        type: "raspberry",
        scroll: "30s",
        body: {
          query: {
            match_all: {}
          },
          sort: { "device_name.keyword": { order: "asc" } }
        }
      })
    );

    while (responseQueue.length) {
      const response = responseQueue.shift();

      responseAll.hits.hits = responseAll.hits.hits.concat(response.hits.hits);

      if (response.hits.total == responseAll.hits.hits.length) {
        break;
      }

      // get the next response if there are more to fetch
      responseQueue.push(
        await client.scroll({
          scrollId: response._scroll_id,
          scroll: "30s"
        })
      );
    }

    return responseAll;
  },
  async listAllPerGroup(group) {
    let responseAll = {};
    responseAll["hits"] = {};
    responseAll.hits.hits = [];
    const responseQueue = [];

    responseQueue.push(
      await client.search({
        index: "screenly",
        type: "raspberry",
        scroll: "30s",
        body: {
          query: {
            match: {
              device_group: group
            }
          },
          sort: { "device_name.keyword": { order: "asc" } }
        }
      })
    );

    while (responseQueue.length) {
      const response = responseQueue.shift();

      responseAll.hits.hits = responseAll.hits.hits.concat(response.hits.hits);

      if (response.hits.total == responseAll.hits.hits.length) {
        break;
      }

      // get the next response if there are more to fetch
      responseQueue.push(
        await client.scroll({
          scrollId: response._scroll_id,
          scroll: "30s"
        })
      );
    }

    return responseAll;
  },
  async searchById(query, group) {
    const response = await client.search({
      index: "screenly",
      type: "raspberry",
      body: {
        query: {
          match: {
            _id: query
          }
        }
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
