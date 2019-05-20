const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
let app_context = process.env.CONTEXT || "/api/v1";

app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(app_context, require("./api.routes"));

let port = process.env.PORT || 5000;
let server = app.listen(port, function() {
  let port = server.address().port;
  console.log("Server started at port %s", port);
});
