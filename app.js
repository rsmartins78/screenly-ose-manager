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
app.use(morgan(`:remote-addr - :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] :response-time ms - :user-agent`));
app.use(express.static('public'));
app.use(appContext, require('./src/routes/routes'));

app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


module.exports = app;
