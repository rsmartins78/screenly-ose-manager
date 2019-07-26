const dbclient = require("../models/ESDevices");
const cron = require("node-cron");
const { checkOnlineDevices } = require("./OnlineDevices");
const { sendToAuditLog } = require("../../lib/auditlog");

let onlineStatus = [];

(async function() {
  onlineStatus = await checkOnlineDevices();
  cron.schedule("1 * * * * *", async () => {
    onlineStatus = await checkOnlineDevices();
  });
})();

module.exports = {
  async GetDevices(req, res) {
    const group = req.userData.group;
    const query = req.query.query;
    function sendResponse(value) {
      if (!value.status) {
        const editedBody = { success: true, message: "Records Loaded" };
        Object.assign(value.hits, editedBody);
        res.send(value.hits);
      } else if (value.status === 404) {
        res
          .status(404)
          .send({ success: false, message: JSON.parse(value.response) });
      }
    }
    if (query === undefined && group == "admin") {
      const resp = await dbclient.listAllDevices();

      for (i in resp.hits.hits) {
        for (o in onlineStatus) {
          if (resp.hits.hits[i]._id == onlineStatus[o].id) {
            resp.hits.hits[i]._source.online = onlineStatus[o].online;
          }
        }
      }

      sendResponse(resp);
      console.log(`New search without query at ${new Date()}`);
    } else if (query === undefined && group !== "admin") {
      const resp = await dbclient.listAllPerGroup(group);
      sendResponse(resp);
    } else if (query && group !== "admin") {
      const resp = await dbclient.searchByQuery(query, group);
      sendResponse(resp);
      console.log(`New search with query ${query} at ${new Date()}`);
    } else {
      res.status(400).send({
        success: false,
        message: "Group not informed"
      });
    }
  },
  // To get one device by id
  async GetOneDevice(req, res) {
    const id = req.params.id;
    const group = req.userData.group;
    if (id != undefined) {
      const response = await dbclient.searchById(id, group);
      if ((response.hits.hits.total = 1)) {
        res.send(response.hits);
      } else {
        res.status(404).send({ success: false, message: "no device found" });
      }
    }
  },
  // To add devices
  async AddDevice(req, res) {
    const payload = req.body;

    let user = req.userData.user;
    let action = "Add Device";
    let message = `Added "${
      payload.device_name
    }", Group "${payload.device_group || "verify"}" with address ${
      payload.device_address
    }" to system`;

    if (payload !== undefined) {
      const resp = await dbclient.addDevice(payload);
      if (resp.result === "created") {
        console.log("Success inserting data on DB");
        res.setHeader("Content-Type", "application/json");
        sendToAuditLog(user, action, message);
        res.send(resp);
      } else {
        console.log("Failed to insert data on DB");
        res.setHeader("Content-Type", "application/json");
        res.status(resp.statusCode).send(resp.response);
      }
    } else {
      console.log("Body Empty Or Incomplete");
      res.setHeader("Content-Type", "application/json");
      res.status(400).send({
        success: false,
        message: "Body empty or incomplete, please verify! "
      });
    }
  },
  // To update devices
  async UpdateDevice(req, res) {
    const deviceId = req.body.id;
    delete req.body.id;
    const payload = req.body;

    let user = req.userData.user;
    let action = "Update Device";
    let message = `Updated device "${deviceId}" with new values: Name: "${
      payload.device_name
    }", Group: "${payload.device_group || "verify"}" and address "${
      payload.device_address
    }"`;

    if (payload !== undefined) {
      try {
        const resp = await dbclient.updateDevice(deviceId, payload);
        if (resp.result === "updated") {
          console.log("Success updating data on DB");
          sendToAuditLog(user, action, message);
          res.setHeader("Content-Type", "application/json");
          res
            .status(200)
            .send({ success: true, message: "Device updated successfully" });
        } else if (resp.result === "noop") {
          console.log("Device without alterations to update");
          res.setHeader("Content-Type", "application/json");
          res
            .status(200)
            .send({ success: true, message: "Device already updated" });
        } else {
          console.log("Failed to update data on DB");
          res.setHeader("Content-Type", "application/json");
          res.status(resp.statusCode).send(resp.response);
        }
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    } else {
      console.log("Body Empty or Incomplete");
      res
        .status(500)
        .send({ success: false, message: "Body empty or incomplete." });
    }
  },
  // To delete devices by ID
  async DeleteDevice(req, res) {
    const deviceId = req.query.id;
    let user = req.userData.user;
    let action = "Delete Device";
    let message = `Deleted device ID "${deviceId}" from system`;
    if (deviceId) {
      const resp = await dbclient
        .deleteDevice(deviceId)
        .then(function(resp) {
          if (resp.result === "deleted") {
            sendToAuditLog(user, action, message);
            res.send(resp);
          } else {
            console.log("Error on delete", resp);
            res.setHeader("Content-Type", "application/json");
            res.status(resp.statusCode).send(resp.response);
          }
        })
        .catch(function(resp) {
          console.log("Error on delete", resp);
          res.setHeader("Content-Type", "application/json");
          res
            .status(resp.statusCode)
            .send({ success: false, message: resp.message });
        });
    }
  }
};
