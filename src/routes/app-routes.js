const express = require('express');

const routes = express.Router();
const AppController = require('../controllers/AppController');
const authMiddleware = require('../middlewares/auth');

// To get devices
routes.get('/login', AppController.Login);
routes.get('/', AppController.Home);
routes.get('/home', authMiddleware, AppController.Home);
// routes.get('home', AppController);


module.exports = routes;
