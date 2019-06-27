const express = require('express');

const routes = express.Router();
const AppController = require('../controllers/AppController');

// To get devices
routes.get('/login', AppController.Login);
routes.get('/', AppController.Home);
routes.get('/home', AppController.Home);
// routes.get('home', AppController);


module.exports = routes;
