const dbclient = require('../models/ESDevices');

module.exports = {
  async GetDevices(req, res) {
    const query = req.query.query;
    const from = 0;
    const size = 10;

    function sendResponse(value) {
      if (!value.status) {
        const editedBody = { success: true, message: 'Records Loaded' };
        Object.assign(value.hits, editedBody);
        res.send(value.hits);
      } else if (value.status === 404) {
        res
          .status(404)
          .send({ success: false, message: JSON.parse(value.response) });
      }
    }

    console.log(query, from, size);

    if (query === undefined && from !== undefined && size !== undefined) {
      const resp = await dbclient.listAllDevices(from, size);
      sendResponse(resp);
      console.log(`New search without query at ${new Date()}`);
    } else if (query && from && size) {
      const resp = await dbclient.searchByQuery(query, from, size);
      sendResponse(resp);
      console.log(`New search with query ${query}at ${new Date()}`);
    } else {
      res.status(400).send({
        success: false,
        message: 'Please define start and limit query',
      });
    }
  },
  // To add devices
  async AddDevice(req, res) {
    const payload = req.body;
    console.log(payload);
    if (payload.device_name && payload.device_group && payload.device_address) {
      const resp = await dbclient.addDevice(payload);
      if (resp.result === 'created') {
        console.log('Success inserting data on DB');
        res.setHeader('Content-Type', 'application/json');
        res.send(resp);
      } else {
        console.log('Failed to insert data on DB');
        res.setHeader('Content-Type', 'application/json');
        res.status(resp.statusCode).send(resp.response);
      }
    } else {
      console.log('Body Empty Or Incomplete');
      res.send(500);
    }
  },
  // To update devices
  async UpdateDevice(req, res) {
    const deviceId = req.body.id;
    delete req.body.id;
    const payload = req.body;
    if (
      deviceId
      && payload.device_name
      && payload.device_group
      && payload.device_address
    ) {
      try {
        const resp = await dbclient.updateDevice(deviceId, payload);
        console.log(resp);

        // res.send(resp)
        if (resp.result === 'updated') {
          console.log('Success updating data on DB');
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send({ success: true, message: 'Device updated successfully' });
        } else if (resp.result === 'noop') {
          console.log('Device without alterations to update');
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send({ success: true, message: 'Device already updated' });
        } else {
          console.log('Failed to update data on DB');
          res.setHeader('Content-Type', 'application/json');
          res.status(resp.statusCode).send(resp.response);
        }
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    } else {
      console.log('Body Empty');
      res.send(500);
    }
  },
  // To delete devices by ID
  async DeleteDevice(req, res) {
    const deviceId = req.query.id;
    if (deviceId) {
      const resp = await dbclient.deleteDevice(deviceId);
      if (resp.result === 'deleted') {
        res.send(resp);
      } else {
        console.log('Error on delete', resp);
        res.setHeader('Content-Type', 'application/json');
        res.status(resp.statusCode).send(resp.response);
      }
    }
  },
};
