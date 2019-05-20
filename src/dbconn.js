const elasticsearch = require("elasticsearch");

const client = new elasticsearch.Client({
  host: process.env.ELASTIC_HOST || "http://localhost:9200/",
  log: process.env.LOG || "info",
  maxRetries: 5,
  requestTimeout: 60000,
});

client.cluster.health({}, function(err, resp, status) {
  console.log("-- Client Health --\n", resp,"\n -- End --");
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
      console.log("DB Structure Ok");
    }
  });
});

module.exports = client;
