const IncomingForm = require('formidable').IncomingForm;
const request = require('request');
const fs = require('fs');

module.exports = {
  async GetAssetsByDevice(req, res) {
    const device = req.params.device;

    if (!device) {
      res.status(400).send({
        success: false,
        message: 'please inform device addess with ?device=value in request url',
      });
    } else {
      const url = `http://${device}/api/v1.1/assets`;

      request.get(
        {
          url,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        (error, response, body) => {
          if (error) {
            console.log(error);
            res.status(500).send(error);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(body);
          }
        },
      );
    }
  },
  // To retrieve the select asset from selected device
  async GetOneAsset(req, res) {
    const device = req.params.device;
    const assetId = req.params.assetId;

    if (!device) {
      res.status(400).send({
        success: false,
        message: 'please inform device addess with ?device=value in request url',
      });
    } else {
      const url = `http://${device}/api/v1.1/assets/${assetId}`;

      request.get(
        {
          url,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        (error, response, body) => {
          if (error) {
            console.log(error);
            res.status(500).send(error);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(body);
          }
        },
      );
    }
  },
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
  async AddAssetToDevice(req, res) {
    const device = req.params.device;
    const body = req.body;

    if (!device) {
      res.status(400).send({
        success: false,
        message:
          'please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080',
      });
    } else {
      const url = `http://${device}/api/v1.1/assets`;

      request.post(
        {
          url,
          headers: {
            'Content-Type': 'application/json',
          },
          body,
          json: true,
        },
        (error, response, responseBody) => {
          if (error) {
            console.log(error);
            res.status(500).send(error);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(responseBody);
          }
        },
      );
    }
  },
  async SendFileAsset(req, res) {
    const device = req.params.device;

    if (!device) {
      res.status(400).send({
        success: false,
        message:
          'please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080',
      });
    }

    const form = new IncomingForm();
    form.uploadDir = 'public/uploads';
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log('some error', err);
        res.status(500).send(err);
      } else if (!files.formData) {
        console.log('no file received');
        res.status(400).send({ success: false, message: 'Failed to receive file' });
      } else {
        const file = files.formData;
        const url = `http://${device}/api/v1/file_asset`;
        const formReq = request.post(url, (error, response, body) => {
          if (error) {
            console.log('Error!\n', error);
            res.status(500).send({ success: false, message: 'Failed to sent file to device' });
          } else {
            console.log('Path on Device:', body);
            res.status(200).send({ success: true, message: 'File sent', path: body.replace(/"/g, '') });
          }
        });

        const form2 = formReq.form();
        form2.append('file_upload', fs.createReadStream(file.path), {
          filename: file.name,
          contentType: file.type,
        });
      }
    });
  },
  // To update an asset in selected device
  async UpdateAsset(req, res) {
    const device = req.params.device;
    const assetId = req.params.assetId;
    const body = req.body;

    if (!device) {
      res.status(400).send({
        success: false,
        message:
          'please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080',
      });
    } else {
      const url = `http://${device}/api/v1.1/assets/${assetId}`;

      request.put(
        {
          url,
          headers: {
            'Content-Type': 'application/json',
          },
          body,
          json: true,
        },
        (error, response, responseBody) => {
          if (error) {
            console.log(error);
            res.status(500).send(error);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(responseBody);
          }
        },
      );
    }
  },
  // To delete an asset to selected device
  async DeleteAsset(req, res) {
    const device = req.params.device;
    const assetId = req.params.assetId;
    const body = req.body;

    if (!device) {
      res.status(400).send({
        success: false,
        message:
          'please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080',
      });
    } else {
      const url = `http://${device}/api/v1.1/assets/${assetId}`;

      request.delete(
        {
          url,
          headers: {
            'Content-Type': 'application/json',
          },
          body,
          json: true,
        },
        (error, response, responseBody) => {
          if (error) {
            console.log(error);
            res.status(500).send(error);
          } else if (responseBody.error) {
            console.log(responseBody.error);
            res.status(503).send(responseBody.error);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res
              .status(200)
              .send({ success: true, message: 'asset removed from device' });
          }
        },
      );
    }
  },
};
