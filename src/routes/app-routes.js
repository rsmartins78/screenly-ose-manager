const express = require('express');

const routes = express.Router();
const AppController = require('../controllers/AppController');
const authMiddleware = require('../middlewares/auth');

// To get devices
routes.get('/login', AppController.Login);
routes.get('/', AppController.Redirect);
routes.get('/home', AppController.Home);
routes.get('/manage_assets', AppController.Assets);
routes.get('/manage_users', AppController.Users);
// routes.get('home', AppController);

module.exports = routes;