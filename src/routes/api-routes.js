const express = require('express');

const routes = express.Router();
const DevicesController = require('../controllers/DevicesController');
const AssetsController = require('../controllers/AssetsController');
const LoginController = require('../controllers/LoginController');
const UsersController = require('../controllers/UsersController');

const authMiddleware = require('../middlewares/auth');

// Auth and Users
routes.get('/login', authMiddleware, LoginController.checkSession);
routes.post('/login', LoginController.login);

routes.get('/users/:id', UsersController.getUserById);
routes.put('/users', UsersController.updateUser);

routes.get('/admin/users', authMiddleware, UsersController.getUsers); // Listar todos os usuários
routes.post('/admin/users', authMiddleware, UsersController.createUser); // Cadastrar novo usuário
routes.delete('/admin/users/:id', authMiddleware, UsersController.deleteUser);


// To get devices
routes.get('/devices', DevicesController.GetDevices);
// To add devices
routes.post('/devices', DevicesController.AddDevice);
// To update devices
routes.put('/devices', DevicesController.UpdateDevice);
// To delete devices by ID
routes.delete('/devices', DevicesController.DeleteDevice);

// To retrieve assets from selected device
routes.get('/assets/:device', AssetsController.GetAssetsByDevice);
// To retrieve the select asset from selected device
routes.get('/assets/:device/:assetId', AssetsController.GetOneAsset);
routes.post('/assets/:device', AssetsController.AddAssetToDevice);
routes.post('/fileassets/:device', AssetsController.SendFileAsset);
// To update an asset in select device
routes.put('/assets/:device/:assetId', AssetsController.UpdateAsset);
// To delete an asset to selected device
routes.delete('/assets/:device/:assetId', AssetsController.DeleteAsset);

module.exports = routes;
