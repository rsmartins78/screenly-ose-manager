const express = require("express");
const IncomingForm = require("formidable").IncomingForm;
const request = require("request");

const routes = express.Router();

const DevicesController = require("../controllers/DevicesController");
const AssetsController = require("../controllers/AssetsController");

// To get devices
routes.get("/devices", DevicesController.GetDevices);
// To add devices
routes.post("/devices", DevicesController.AddDevice);
// To update devices
routes.put("/devices", DevicesController.UpdateDevice);
// To delete devices by ID
routes.delete("/devices", DevicesController.DeleteDevice);

// To retrieve assets from selected device
routes.get("/assets/:device", AssetsController.GetAssetsByDevice);
// To retrieve the select asset from selected device
routes.get("/assets/:device/:assetId", AssetsController.GetOneAsset);
routes.post("/assets/:device", AssetsController.AddAssetToDevice);
routes.post("/fileassets/:device", AssetsController.SendFileAsset);
// To update an asset in select device
routes.put("/assets/:device/:assetId", AssetsController.UpdateAsset);
// To delete an asset to selected device
routes.delete("/assets/:device/:assetId", AssetsController.DeleteAsset);

module.exports = routes;
