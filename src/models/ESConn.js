const { Client } = require("elasticsearch");
const { encryptData } = require("../../lib/encrypt");

const client = new Client({
  host: process.env.ELASTIC_HOST || "http://localhost:9200/",
  log: process.env.ELASTIC_LOG_LEVEL || "info",
  maxRetries: 5,
  requestTimeout: 60000
});

function checkFirstAdmin() {
  client.search(
    {
      index: "screenly-users",
      type: "users",
      body: {
        query: {
          match: {
            group: "admin"
          }
        }
      }
    },
    (error, result, status) => {
      if (result && result.hits.total == 0) {
        console.log("No one admins found, creating one.");
        const passwd = encryptData(process.env.ADMIN_PASS || "admin");
        client.index(
          {
            index: "screenly-users",
            type: "users",
            body: {
              username: process.env.ADMIN_USER || "admin",
              password: passwd,
              group: "admin",
              createdAt: Date(),
              lastLoginAt: Date()
            }
          },
          function(error, result) {
            if (!error && result.result == "created") {
              console.log("New admin user created!");
            }
          }
        );
      }
    }
  );
}

client.cluster.health({}, function(err, health) {
  console.log("-- Client Health --\n", health, "\n -- End --");
});

// Check if screenly devices indice exists, if not, create it
client.indices.exists({ index: "screenly" }, function(error, exists) {
  if (error) {
    throw new Error(error.message);
  }
  if (exists === false) {
    console.log(result);
    client.indices.create(
      {
        index: "screenly"
      },
      (exception, res) => {
        if (err) {
          throw new Error(exception);
        } else {
          console.log(res);
          console.log("DB: Devices Structure OK");
        }
      }
    );
  } else {
    console.log("Devices Structure Ok");
  }
});

client.indices.exists({ index: "screenly-users" }, (error, result) => {
  if (error) {
    throw new Error(error.message);
  }
  if (result === false) {
    client.indices.create(
      {
        index: "screenly-users"
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
});

module.exports = client;
