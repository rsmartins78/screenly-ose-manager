const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');
const morgan = require('morgan');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const appContext = process.env.CONTEXT || '/api/v1';

app.use(cors());
app.use(bodyParser.json());
app.use(morgan((tokens, req, res) => [
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'), '-',
  tokens['response-time'](req, res), 'ms',
].join(' ')));

app.use(express.static('public'));
app.use(appContext, require('./api.routes'));

module.exports = app;
