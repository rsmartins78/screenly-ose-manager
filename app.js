const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const specs = require('./src/config/swagger');

const app = express();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const apiContext = process.env.CONTEXT || '/api/v1';
const appContext = '/';

//Ejs view config
app.set('views', 'src/views');
app.set('view engine', 'ejs');


app.use(cors());
app.use(bodyParser.json());
app.use(morgan(`:remote-addr - :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] :response-time ms - :user-agent`));
app.use(express.static('public'));
app.use(apiContext, require('./src/routes/api-routes'));
app.use(appContext, require('./src/routes/app-routes'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
  
// error handler
app.use(function(err, req, res, next) {
    // render the error page
    res.status(err.status || 500);
    res.render('error', {status:err.status, message:err.message});
});

module.exports = app;
