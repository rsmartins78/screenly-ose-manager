const IncomingForm = require("formidable").IncomingForm;
const request = require("request-promise-native");
const fs = require("fs");

const { sendToAuditLog } = require("../../lib/auditlog");

module.exports = {
  async GetAssetsByDevice(req, res) {
    const device = req.params.device;
    const authorization = req.headers.deviceauth;
    if (!device) {
      res.status(400).send({
        success: false,
        message: "please inform device addess with ?device=value in request url"
      });
    } else {
      const url = `http://${device}/api/v1.2/assets`;

      await request
        .get({
          url,
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization
          },
          timeout: 5000
        })
        .then(response => {
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(response);
        })
        .catch(response => {
          console.log("Error:", response.error, "on device", device);
          res.status(500).send({
            success: false,
            message: response.error,
            location: response.options.url
          });
        });
    }
  },
  // To retrieve the select asset from selected device
  async GetOneAsset(req, res) {
    const device = req.params.device;
    const assetId = req.params.assetId;
    const authorization = req.headers.deviceauth;

    if (!device) {
      res.status(400).send({
        success: false,
        message: "please inform device addess with ?device=value in request url"
      });
    } else {
      const url = `http://${device}/api/v1.2/assets/${assetId}`;

      await request
        .get({
          url,
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization
          },
          timeout: 5000
        })
        .then(response => {
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(response);
        })
        .catch(response => {
          console.log("Error:", response.error, "on device", device);
          res.status(500).send({
            success: false,
            message: response.error,
            location: response.options.url
          });
        });
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
    const authorization = req.headers.deviceauth;

    let user = req.userData.user;
    let action = "Add Asset to Device";
    let message = `Added "${body.name}" with path "${body.uri}", type "${
      body.mimetype
    }" and state "${body.is_active == 1 ? `active` : `inactive`}" to device ${device}`;

    if (!device) {
      res.status(400).send({
        success: false,
        message:
          "please inform device address in request url, example: /api/v1/assets/10.10.10.10:8080"
      });
    } else {
      const url = `http://${device}/api/v1.2/assets`;

      await request
        .post({
          url,
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization
          },
          body,
          json: true,
          timeout: 5000
        })
        .then(resp => {
          sendToAuditLog(user, action, message);
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(resp);
        })
        .catch(response => {
          console.log("Error:", response.error, "on device", device);
          res.status(500).send({
            success: false,
            message: response.error,
            location: response.options.url
          });
        });
    }
  },

  async SendFileAsset(req, res) {
    const device = req.params.device;
    const authorization = req.headers.deviceauth;

    if (!device) {
      res.status(400).send({
        success: false,
        message:
          "please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080"
      });
    }

    const form = new IncomingForm();
    form.uploadDir = "public/uploads";
    form.keepExtensions = true;

    try {
      if (!fs.existsSync(form.uploadDir)) {
        fs.mkdirSync(form.uploadDir, { recursive: true });
        console.log("Diretorio uploadedFiles criado!");
      }

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.log("some error", err);
          res.status(500).send(err);
        } else if (!files.formData) {
          console.log("no file received");
          res
            .status(400)
            .send({ success: false, message: "Failed to receive file" });
        } else {
          const file = files.formData;
          const url = `http://${device}/api/v1/file_asset`;
          const formReq = request.post(
            url,
            {
              timeout: 300000,
              headers: {
                Authorization: authorization
              }
            },
            (error, response, body) => {
              if (error) {
                console.log("Error!\n", error);
                res.status(500).send({
                  success: false,
                  message: "Failed to sent file to device"
                });
              } else {
                console.log("Path on Device:", body);
                res.status(200).send({
                  success: true,
                  message: "File sent",
                  path: body.replace(/"/g, ""),
                  mimetype: file.type.split("/")[0]
                });
              }
            }
          );

          const form2 = formReq.form();
          form2.append("file_upload", fs.createReadStream(file.path), {
            filename: file.name,
            contentType: file.type
          });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ success: false, message: error });
    }
  },
  // To update an asset in selected device
  async UpdateAsset(req, res) {
    const device = req.params.device;
    const assetId = req.params.assetId;
    const body = req.body;
    const authorization = req.headers.deviceauth;

    let user = req.userData.user;
    let action = "Update Asset on Device";
    let message = `Updated "${body.name}/${assetId}" with path "${
      body.uri
    }", type "${body.mimetype}" and state "${body.is_active == 1 ? `active` : `inactive`}" to device ${device}`;

    if (!device) {
      res.status(400).send({
        success: false,
        message:
          "please inform device address in request url, example: /api/v1/assets/10.10.10.10:8080"
      });
    } else {
      const url = `http://${device}/api/v1.2/assets/${assetId}`;

      await request
        .put({
          url,
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization
          },
          body,
          json: true,
          timeout: 5000
        })
        .then(response => {
          sendToAuditLog(user, action, message);
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(response);
        })
        .catch(response => {
          console.log("Error:", response.error, "on device", device);
          res.status(500).send({
            success: false,
            message: response.error,
            location: response.options.url
          });
        });
    }
  },
  // To delete an asset to selected device
  async DeleteAsset(req, res) {
    const device = req.params.device;
    const assetId = req.params.assetId;
    const authorization = req.headers.deviceauth;

    let user = req.userData.user;
    let action = "Delete Asset from Device";
    let message = `Deleted "${assetId}" from device "${device}"`;

    if (!device) {
      res.status(400).send({
        success: false,
        message:
          "please inform device addess in request url, example: /api/v1/assets/10.10.10.10:8080"
      });
    } else {
      const url = `http://${device}/api/v1.2/assets/${assetId}`;

      await request
        .delete(url, {
          timeout: 5000,
          headers: {
            Authorization: authorization
          }
        })
        .then(response => {
          sendToAuditLog(user, action, message);
          res.setHeader("Content-Type", "application/json");
          res.status(200).send({
            success: true,
            message: "Asset removed from device " + device
          });
        })
        .catch(response => {
          console.log("Error:", response.error, "on device", device);
          res.status(500).send({
            success: false,
            message: response.error,
            location: response.options.url
          });
        });
    }
  }
};
