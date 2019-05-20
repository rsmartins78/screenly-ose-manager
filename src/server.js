const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.use(cors());
app.use(bodyParser.json());

var app_context = process.env.CONTEXT || "/api/v1";
app.use(app_context, require("./api.routes"));

var port = process.env.PORT || 5000;
var server = app.listen(port, function() {
  var port = server.address().port;
  console.log("Server started at port %s", port);
});
