const IncomingForm = require('formidable').IncomingForm;
const request = require('request');
const fs = require('fs');
const ejs = require('ejs');

module.exports = {
  async Login(req, res) {
    res.render('index', {page:'Login', menuId:'login'});
  },
  async Home(req, res) {
    res.render('home', {page:'Home', menuId:'home'});
  },
}