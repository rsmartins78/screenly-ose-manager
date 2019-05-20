const client = require("./dbconn.js");

module.exports = {
  insertdevice: function(payload, callback) {
    client.index(
      {
        index: "screenly",
        type: "raspberry",
        body: payload
      },
      function(error, response, status) {
        if (error) {
          console.log(error);
          callback(error);
        } else {
          callback(response);
        }
      }
    );
  },

  searchAll: function(from, size, callback) {
    client.search(
      {
        index: "screenly",
        type: "raspberry",
        body: {
          query: {
            match_all: {}
          }
          // from: from,
          // size: size,
          // sort: [
          //   {
          //     createdAt: {
          //       order: "desc"
          //     }
          //   }
          // ]
        }
      },
      function(error, response, status) {
        if (error) {
          console.log("search error: " + error);
          console.log(error);
          callback(error);
        } else {
          callback(response);
        }
      }
    );
  },

  searchByQuery: function(query, from, size, callback) {
    client.search(
      {
        index: "screenly",
        type: "raspberry",
        body: {
          query: {
            query_string: {
              query: query,
              default_operator: "AND"
            }
          }
          // from: from,
          // size: size,
          // sort: { createdAt: { order: "desc" } }
        }
      },
      function(error, response, status) {
        if (error) {
          console.log("search error: " + error);
          callback(error);
        } else {
          console.log("Query com sucesso");
          callback(response);
        }
      }
    );
  },

  updateDevice: function(id, payload, callback) {
    client.update(
      {
        index: "screenly",
        type: "raspberry",
        id: id,
        body: {
          doc: {
            device_name: payload.device_name,
            device_group: payload.device_group,
            device_address: payload.device_address
          }
        }
      },
      function(err, resp, status) {
        if (err) {
          callback(err);
        } else {
          callback(resp);
        }
      }
    );
  },

  deleteDevice: function(id, callback) {
    client.delete({ index: "screenly", id: id, type: "raspberry" }, function(
      error,
      response,
      status
    ) {
      if (error) {
        console.log("delete error: " + error);
        console.log(error);
        callback(error);
      } else {
        callback(response);
      }
    });
  },

  checkDbAlive: function() {
    client.ping(
      {
        requestTimeout: 30000
      },
      function(error) {
        if (error) {
          console.error("elasticsearch cluster is down!");
        } else {
          console.log("Everything is ok");
        }
      }
    );
  }
};
