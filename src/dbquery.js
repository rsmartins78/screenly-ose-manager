const client = require('./dbconn.js');

module.exports = {
  insertdevice(payload, callback) {
    client.index(
      {
        index: 'screenly',
        type: 'raspberry',
        body: payload,
      },
      (error, response) => {
        if (error) {
          console.log(error);
          callback(error);
        } else {
          callback(response);
        }
      },
    );
  },

  searchAll(from, size, callback) {
    client.search(
      {
        index: 'screenly',
        type: 'raspberry',
        body: {
          query: {
            match_all: {},
          },
          // from: from,
          // size: size,
          // sort: [
          //   {
          //     createdAt: {
          //       order: "desc"
          //     }
          //   }
          // ]
        },
      },
      (error, response) => {
        if (error) {
          console.log(`search error: ${error}`);
          console.log(error);
          callback(error);
        } else {
          callback(response);
        }
      },
    );
  },

  searchByQuery(query, from, size, callback) {
    client.search(
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
          // from: from,
          // size: size,
          // sort: { createdAt: { order: "desc" } }
        },
      },
      (error, response) => {
        if (error) {
          console.log(`search error: ${error}`);
          callback(error);
        } else {
          console.log('Query com sucesso');
          callback(response);
        }
      },
    );
  },

  updateDevice(id, payload, callback) {
    client.update(
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
      (err, resp) => {
        if (err) {
          callback(err);
        } else {
          callback(resp);
        }
      },
    );
  },

  deleteDevice(id, callback) {
    client.delete({ index: 'screenly', id, type: 'raspberry' }, (
      error,
      response,
    ) => {
      if (error) {
        console.log(`delete error: ${error}`);
        console.log(error);
        callback(error);
      } else {
        callback(response);
      }
    });
  },

  checkDbAlive() {
    client.ping(
      {
        requestTimeout: 30000,
      },
      (error) => {
        if (error) {
          console.error('elasticsearch cluster is down!');
        } else {
          console.log('Everything is ok');
        }
      },
    );
  },
};
