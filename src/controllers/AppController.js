const IncomingForm = require('formidable').IncomingForm;
const request = require('request');
const fs = require('fs');
const ejs = require('ejs');
const dbclient = require('../models/ESDevices');


module.exports = {
  async Login(req, res) {
    res.render('index', {page:'Login', menuId:'login'});
  },
  async Home(req, res) {
    const resp = await dbclient.listAllDevices();
    res.render('home', {page:'Home', menuId:'home', devices: resp.hits});
  },
  async Redirect(req, res) {
      res.redirect('/home')
  },
  async Assets(req, res) {
    res.render('assets', {page:'Assets', menuId:'assets'});
  }
}