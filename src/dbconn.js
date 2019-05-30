const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: process.env.ELASTIC_HOST || 'http://localhost:9200/',
  log: process.env.LOG || 'info',
  maxRetries: 5,
  requestTimeout: 60000,
});

client.cluster.health({}, (err, resp) => {
  if (err) {
    throw new Error(err.message);
  }
  console.log('-- Client Health --\n', resp, '\n -- End --');
  client.indices.exists({ index: 'screenly' }, (error, result) => {
    if (error) {
      throw new Error(error.message);
    }
    if (resp === false) {
      console.log(result);
      client.indices.create(
        {
          index: 'screenly',
        },
        (exception, res) => {
          if (err) {
            throw new Error(exception);
          } else {
            console.log(res);
            console.log("Indice 'screenly' criado.");
          }
        },
      );
    } else {
      console.log('DB Structure Ok');
    }
  });
});

module.exports = client;
