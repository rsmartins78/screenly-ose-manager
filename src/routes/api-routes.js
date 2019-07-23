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
routes.put('/users', UsersController.updatePassword);

routes.get('/admin/users', authMiddleware, UsersController.getUsers); // Listar todos os usuários
routes.post('/admin/users', authMiddleware, UsersController.createUser); // Cadastrar novo usuário
routes.put('/admin/users/:id', authMiddleware, UsersController.updateUser); // Cadastrar novo usuário
routes.delete('/admin/users/:id', authMiddleware, UsersController.deleteUser);


// To get devices
routes.get('/devices', authMiddleware, DevicesController.GetDevices);
// To one device
routes.get('/devices/:id', authMiddleware, DevicesController.GetOneDevice);
// To add devices
routes.post('/devices', authMiddleware, DevicesController.AddDevice);
// To update devices
routes.put('/devices', authMiddleware, DevicesController.UpdateDevice);
// To delete devices by ID
routes.delete('/devices', authMiddleware, DevicesController.DeleteDevice);

// To retrieve assets from selected device
routes.get('/assets/:device', authMiddleware, AssetsController.GetAssetsByDevice);
routes.post('/assets/:device', authMiddleware, AssetsController.AddAssetToDevice);
routes.post('/fileassets/:device', authMiddleware, AssetsController.SendFileAsset);

// To retrieve the select asset from selected device
routes.get('/assets/:device/:assetId', authMiddleware, AssetsController.GetOneAsset);
// To update an asset in select device
routes.put('/assets/:device/:assetId', authMiddleware, AssetsController.UpdateAsset);
// To delete an asset to selected device
routes.delete('/assets/:device/:assetId', authMiddleware, AssetsController.DeleteAsset);
// To retrieve the select asset from selected device
routes.get('/assets/:device/:assetId', authMiddleware, AssetsController.GetOneAsset);
// To send a file and get the path and mimetype
routes.post('/fileassets/:device', authMiddleware, AssetsController.SendFileAsset);

module.exports = routes;

