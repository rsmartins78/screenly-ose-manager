const express = require('express');

const routes = express.Router();
const AppController = require('../controllers/AppController');
const authMiddleware = require('../middlewares/auth');

const authMiddleware = require('../middlewares/auth');

// To get devices
routes.get('/login', AppController.Login);
<<<<<<< HEAD
routes.get('/', AppController.Home);
=======
routes.get('/', (req, res) => {
    res.redirect('/home')
});
>>>>>>> aeb68d2a1a357396e1c41a578e86c34263747803
routes.get('/home', authMiddleware, AppController.Home);
// routes.get('home', AppController);


module.exports = routes;
