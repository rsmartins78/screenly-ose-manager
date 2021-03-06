const { Client } = require("elasticsearch");
const { encryptData } = require("../../lib/encrypt");
const { getTime } = require("../../lib/getTime");

const client = new Client({
  host: process.env.ELASTIC_HOST || "http://localhost:9200/",
  log: process.env.ELASTIC_LOG_LEVEL || "info",
  maxRetries: 5,
  requestTimeout: 60000
});

async function checkFirstAdmin() {
  const passwd = await encryptData(process.env.ADMIN_PASS || "admin");
  const search = await client.search({
    index: "screenly-users",
    type: "users",
    body: {
      query: {
        match: {
          group: "admin"
        }
      }
    }
  });
  if (search && search.hits.total == 0) {
    console.log("No one admins found, creating one.");
    const time = await getTime();
    const index = await client.index({
      index: "screenly-users",
      type: "users",
      body: {
        username: process.env.ADMIN_USER || "admin",
        name: process.env.ADMIN_NAME || "Administrator",
        password: passwd,
        group: "admin",
        createdAt: time,
        lastLoginAt: time
      }
    });
    if (index && index.result == "created") {
      console.log("New admin user created!");
    }
  }
}

async function checkFirstDevice() {
  const search = await client.search({
    index: "screenly-users",
    type: "users",
    body: {
      query: {
        match_all: {}
      }
    }
  });
  if (search && search.hits.total == 0) {
    console.log("No devices found, creating one.");
    const time = await getTime();
    const index = await client.index({
      index: "screenly",
      type: "raspberry",
      body: {
        device_name: "Dummy Device",
        device_address: "127.0.0.1",
        device_group: "group1",
        createdAt: time,
        lastCheckAt: time
      }
    });
    if (index && index.result == "created") {
      console.log("New dummy device created!");
    }
  }
}

// Check if screenly devices indice exists, if not, create it
client.indices.exists(
  {
    index: "screenly"
  },
  function(error, exists) {
    if (error) {
      throw new Error(error.message);
    }
    if (exists === false) {
      client.indices.create(
        {
          index: "screenly",
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0
            }
          }
        },
        (err, res) => {
          if (err) {
            throw new Error(err);
          } else {
            checkFirstDevice();
            console.log("DB: Devices Structure OK");
          }
        }
      );
    } else {
      checkFirstDevice();
      console.log("Devices Structure Ok");
    }
  }
);

// Check if screenly users indice exists, if not, create it
client.indices.exists(
  {
    index: "screenly-users"
  },
  (error, result) => {
    if (error) {
      throw new Error(error.message);
    }
    if (result === false) {
      client.indices.create(
        {
          index: "screenly-users",
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0
            }
          }
        },
        (exception, res) => {
          if (exception) {
            throw new Error(exception);
          } else {
            checkFirstAdmin();
            console.log("DB: Users Structure OK");
          }
        }
      );
    } else {
      checkFirstAdmin();
      console.log("Users Structure Ok");
    }
  }
);

// Check if audit log indice exists, if not, create it
client.indices.exists(
  {
    index: "screenly-auditlog"
  },
  (error, result) => {
    if (error) {
      throw new Error(error.message);
    }
    if (result === false) {
      client.indices.create(
        {
          index: "screenly-auditlog",
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0
            }
          }
        },
        (exception, res) => {
          if (exception) {
            throw new Error(exception);
          } else {
            checkFirstAdmin();
            console.log("DB: Audit Log Structure OK");
          }
        }
      );
    } else {
      console.log("Audit Log Structure Ok");
    }
  }
);

module.exports = client;
