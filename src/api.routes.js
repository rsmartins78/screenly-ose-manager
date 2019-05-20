const express = require("express");
const routes = express.Router();
const request = require("request");
const dbclient = require("./dbquery");
var IncomingForm = require("formidable").IncomingForm;

// To get devices
routes.get("/devices", (req, res) => {
  let query = req.query.query;
  // let from = req.query.start;
  // let size = req.query.limit;
  let from = 0;
  let size = 0;

  function sendResponse(value) {
    if (!value.status) {
      let editedBody = { success: true, message: "Records Loaded" };
      Object.assign(value.hits, editedBody);
      res.send(value.hits);
    } else if (value.status == 404) {
      res
        .status(404)
        .send({ success: false, message: JSON.parse(value.response) });
    }
  }

  if (from !== undefined && size !== undefined && query == undefined) {
    dbclient.searchAll(from, size, sendResponse);
    console.log("New search without query at " + new Date());
  } else if (from !== undefined && size !== undefined && query !== undefined) {
    dbclient.searchByQuery(query, from, size, sendResponse);
    console.log("New search with query " + query + "at " + new Date());
  } else {
    res.status(400).send({
      success: false,
      message: "Please define start and limit query"
    });
  }
});

// To add devices
routes.post("/devices", (req, res) => {
  let payload = req.body;
  if (payload.device_name && payload.device_group && payload.device_address) {
    dbclient.insertdevice(payload, function(resp) {
      if (resp.result == "created") {
        console.log("Success inserting data on DB");
        res.setHeader("Content-Type", "application/json");
        res.send(resp);
      } else {
        console.log("Failed to insert data on DB");
        res.setHeader("Content-Type", "application/json");
        res.status(resp.statusCode).send(resp.response);
      }
    });
  } else {
    console.log("Body Empty");
    res.send(500);
  }
});

// To update devices
routes.put("/devices", (req, res) => {
  let device_id = req.body.id;
  delete req.body.id;
  let payload = req.body;
  if (
    device_id &&
    payload.device_name &&
    payload.device_group &&
    payload.device_address
  ) {
    try {
      dbclient.updateDevice(device_id, payload, function(resp) {
        // res.send(resp)
        if (resp.result == "noop") {
          console.log("Success updating data on DB");
          res.setHeader("Content-Type", "application/json");
          res.send(resp);
        } else {
          console.log("Failed to update data on DB");
          res.setHeader("Content-Type", "application/json");
          res.status(resp.statusCode).send(resp.response);
        }
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("Body Empty");
    res.send(500);
  }
});

// To delete devices by ID
routes.delete("/devices", (req, res) => {
  let device_id = req.query.id;
  if (device_id) {
    dbclient.deleteDevice(device_id, function(resp) {
      if (resp.result == "deleted") {
        res.send(resp);
      } else {
        console.log("Error on delete", resp);
        res.setHeader("Content-Type", "application/json");
        res.status(resp.statusCode).send(resp.response);
      }
    });
  }
});

// To retrieve assets from selected device
routes.get("/assets/:device", (req, res) => {
  let device = req.params.device;

  if (device == undefined) {
    res.status(400).send({
      success: false,
      message: "please inform device addess with ?device=value in request url"
    });
  } else {
    let url = "http://" + device + "/api/v1.1/assets";

    request.get(
      {
        url: url,
        headers: {
          "Content-Type": "application/json"
        }
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        } else {
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(body);
        }
      }
    );
  }
});

// To retrieve the select asset from selected device
routes.get("/assets/:device/:assetId", (req, res) => {
  let device = req.params.device;
  let assetId = req.params.assetId;

  if (device == undefined) {
    res.status(400).send({
      success: false,
      message: "please inform device addess with ?device=value in request url"
    });
  } else {
    let url = "http://" + device + "/api/v1.1/assets/" + assetId;

    request.get(
      {
        url: url,
        headers: {
          "Content-Type": "application/json"
        }
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        } else {
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(body);
        }
      }
    );
  }
});

// To insert asset to selected device
// Necessary to inform device address on query string
// Payload Example:
// {
//   "name":"Teste",
//   "mimetype":"webpage",
//   "uri":"http://localhost:8080",
//   "is_active":1,
//   "start_date":"2019-05-20T14:34:00.000Z",
//   "end_date":"2019-06-19T14:34:00.000Z",
//   "duration":"10",
//   "is_enabled":0,
//   "is_processing":0,
//   "nocache":0,
//   "play_order":0,
//   "skip_asset_check":"1"
// }
routes.post("/assets/:device", (req, res) => {
  let device = req.params.device;
  let body = req.body;

  if (device == undefined) {
    res.status(400).send({
      success: false,
      message:
        "please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080"
    });
  } else {
    let url = "http://" + device + "/api/v1.1/assets";

    request.post(
      {
        url: url,
        headers: {
          "Content-Type": "application/json"
        },
        body: body,
        json: true
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        } else {
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(body);
        }
      }
    );
  }
});

routes.post("/fileassets/:device", (req, res) => {
  let device = req.params.device;

  if (device == undefined) {
    res.status(400).send({
      success: false,
      message:
        "please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080"
    });
  }

  let form = new IncomingForm();
  form.uploadDir = "uploads";
  form.keepExtensions = true;

  form.parse(req, function(err, fields, files) {
    if (err) {
      console.log("some error", err);
      res.send(500);
    } else if (!files.file) {
      console.log("no file received");
      res.send(400);
    } else {
      var file = files.file;
      console.log("saved file to", file.path);
      console.log("original name", file.name);
      console.log("type", file.type);
      console.log("size", file.size);
      res.send(200);
    }
  });


  // } else {
  //   let url = "http://" + device + "/api/v1/file_asset";

  //   request.post(
  //     {
  //       url: url,
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: body,
  //       json: true
  //     },
  //     function(error, response, body) {
  //       if (error) {
  //         console.log(error);
  //         res.status(500).send(error);
  //       } else {
  //         res.setHeader("Content-Type", "application/json");
  //         res.status(200).send(body);
  //       }
  //     }
  //   );
  // }
});

// To update an asset in select device
routes.put("/assets/:device/:assetId", (req, res) => {
  let device = req.params.device;
  let assetId = req.params.assetId;
  let body = req.body;

  if (device == undefined) {
    res.status(400).send({
      success: false,
      message:
        "please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080"
    });
  } else {
    let url = "http://" + device + "/api/v1.1/assets/" + assetId;

    request.put(
      {
        url: url,
        headers: {
          "Content-Type": "application/json"
        },
        body: body,
        json: true
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        } else {
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(body);
        }
      }
    );
  }
});

// To delete an asset to selected device
routes.delete("/assets/:device/:assetId", (req, res) => {
  let device = req.params.device;
  let assetId = req.params.assetId;
  let body = req.body;

  if (device == undefined) {
    res.status(400).send({
      success: false,
      message:
        "please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080"
    });
  } else {
    let url = "http://" + device + "/api/v1.1/assets/" + assetId;

    request.delete(
      {
        url: url,
        headers: {
          "Content-Type": "application/json"
        }
        // body: body,
        // json: true
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        } else {
          if (body.error) {
            console.log(body.error);
            res.status(503).send(body.error);
          } else {
            res.setHeader("Content-Type", "application/json");
            res
              .status(200)
              .send({ success: true, message: "asset removed from device" });
          }
        }
      }
    );
  }
});

module.exports = routes;
