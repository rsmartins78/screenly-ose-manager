const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const specs = require('./src/config/swagger');

const app = express();
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
app.use(appContext, require('./src/api.routes'));

app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


module.exports = app;
