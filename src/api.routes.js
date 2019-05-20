const express = require("express");
const routes = express.Router();
const request = require("request");
const dbclient = require("./dbquery");

// To get devices
routes.get("/devices", (req, res) => {
  var query = req.query.query;
  // var from = req.query.start;
  // var size = req.query.limit;
  var from = 0;
  var size = 0;

  function sendResponse(value) {
    if (!value.status) {
      var editedBody = { success: true, message: "Records Loaded" };
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
  var device_id = req.query.id;
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

routes.get("/assets", (req, res) => {
  let device = req.query.device;
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
});

module.exports = routes;
