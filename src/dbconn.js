var elasticsearch = require("elasticsearch");

var client = new elasticsearch.Client({
  host: process.env.ELASTIC_HOST || "http://localhost:9200/",
  // log: "trace",
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true
});

client.cluster.health({}, function(err, resp, status) {
  console.log("-- Client Health --\n", resp);
  client.indices.exists({ index: "screenly" }, function(error, resp, status) {
    if (resp === false) {
      console.log(resp);
      client.indices.create(
        {
          index: "screenly"
        },
        function(error, resp, status) {
          if (error) {
            console.log(error);
          } else {
            console.log(resp);
            console.log("Indice 'screenly' criado.");
          }
        }
      );
    } else {
      console.log("Indice 'screenly' já existe, não será criado.");
    }
  });
});

module.exports = client;
