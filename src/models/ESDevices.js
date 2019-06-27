const client = require('./ESConn.js');

module.exports = {
  async addDevice(payload) {
    const response = client.index(
      {
        index: 'screenly',
        type: 'raspberry',
        body: payload,
      },
    );
    return response;
  },

  async listAllDevices(from, size) {
    const response = client.search(
      {
        index: 'screenly',
        type: 'raspberry',
        body: {
          query: {
            match_all: {},
          },
          // from,
          // size,
        },
      },
    );
    return response;
  },

  async searchByQuery(query, from, size) {
    const response = client.search(
      {
        index: 'screenly',
        type: 'raspberry',
        body: {
          query: {
            query_string: {
              query,
              default_operator: 'AND',
            },
          },
          from,
          size,
        },
      },
    );
    return response;
  },

  async updateDevice(id, payload) {
    const response = client.update(
      {
        index: 'screenly',
        type: 'raspberry',
        id,
        body: {
          doc: {
            device_name: payload.device_name,
            device_group: payload.device_group,
            device_address: payload.device_address,
          },
        },
      },
    );
    return response;
  },

  async deleteDevice(id) {
    const response = client.delete(
      { index: 'screenly', id, type: 'raspberry' },
    );
    return response;
  },
};
